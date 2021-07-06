import { makeStyles } from '@material-ui/core/styles'

const CommonStyle = makeStyles({
  h255: {
    height: '255px'
  },
  mt1: {
    marginTop: '1rem'
  },
  mb1: {
    marginBottom: '1rem'
  },
  mb2: {
    marginBottom: '2rem'
  },
  bc: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    right: '25%'
  },
  b1: {
    width: '100%',
    padding: '.32rem',
    fontSize: '1.2rem',
    border: '1px solid #84A8E3',
    borderRadius: '.25rem',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    color: '#999',
    '&:hover': {
      color: '#fafafa',
      backgroundColor: '#84A8E3',
      transition: '.3s ease'
    }
  },
  a1: {
    width: '100%',
    marginTop: '.6888rem',
    padding: '.2255rem',
    border: '1px solid #999',
    borderRadius: '.25rem',
    textDecoration: 'none'
  }
})

export default CommonStyle