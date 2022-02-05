import { ReviewScore, Review } from '@prisma/client'
import { ReviewScore as EntityReviewScore, Review as EntityReview } from '@entities/Review'
import { ReviewRepositoryInterface } from '@client/review/services/ReviewService'
import prisma from '@lib/prisma'

const convertReviewScoreToEntity = (score: ReviewScore): EntityReviewScore => {
  switch (score) {
    case ReviewScore.ONE:
      return EntityReviewScore.one
    case ReviewScore.TWO:
      return EntityReviewScore.two
    case ReviewScore.THREE:
      return EntityReviewScore.three
    case ReviewScore.FOUR:
      return EntityReviewScore.four
    default:
      return EntityReviewScore.five
  }
}

const convertEntityToReviewScore = (score: EntityReviewScore): ReviewScore => {
  switch (score) {
    case EntityReviewScore.one:
      return ReviewScore.ONE
    case EntityReviewScore.two:
      return ReviewScore.TWO
    case EntityReviewScore.three:
      return ReviewScore.THREE
    case EntityReviewScore.four:
      return ReviewScore.FOUR
    default:
      return ReviewScore.FIVE
  }
}

const reconstructReview = (review: Review): EntityReview => ({
  id: review.id,
  text: review.text,
  shopId: review.shopId,
  score: convertReviewScoreToEntity(review.score),
  clientId: review.userId,
})

const ReviewRepository: ReviewRepositoryInterface = {
  async fetchShopReviews(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const reviews = await prisma.review.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: order },
      take,
    })

    return reviews.map(reconstructReview)
  },

  async fetchShopReviewsTotalCount(shopId) {
    return prisma.review.count({ where: { shopId } })
  },

  async fetchShopReview(shopId, reviewId) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, AND: { shopId } },
    })
    return review ? reconstructReview(review) : null
  },

  async updateReview(userId, shopId, reviewId, text, score) {
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        userId,
        shopId,
        text,
        score: convertEntityToReviewScore(score),
      },
    })
    return reconstructReview(updatedReview)
  },
}

export default ReviewRepository
