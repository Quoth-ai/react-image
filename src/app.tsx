import React, { Suspense, useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Img, useImage } from './index'
//const {Img, useImage} = require('../cjs')

interface ErrorBoundary {
  props: {
    children: React.ReactNode
    onError?: React.ReactNode
  }
}
class ErrorBoundary extends React.Component implements ErrorBoundary {
  state: {
    hasError: boolean
  }
  onError: React.ReactNode

  constructor(props) {
    super(props)
    this.state = { hasError: false }
    this.onError = props.onError
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: error }
  }

  render() {
    if (this.state.hasError) {
      if (this.onError) return this.onError
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}

const randSeconds = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min)

function Timer({ until }) {
  const startTimeRef = useRef(Date.now())
  const [time, setTime] = useState(Date.now() - startTimeRef.current)

  useEffect(() => {
    const timer = setTimeout(
      () => setTime(Date.now() - startTimeRef.current),
      1000
    )
    return () => clearTimeout(timer)
  }, [time])

  if (time / 1000 - 5 > until) return <h3>Max time elapsed!</h3>
  return <h3>Elapsed seconds: {Math.trunc(time / 1000)}</h3>
}

const HooksLegacyExample = ({ rand }) => {
  const { src, isLoading, error } = useImage({
    srcList: [
      `http://deelay.me/${1 * 1000}/https://ipfs.io/ipfs/QmWQrZfeBcSswv6wxsBgd8w4oqmidj1FqzXLMDVmZyjab8`, // will be loaded
      `http://deelay.me/${2 * 1000}/https://ipfs.io/ipfs/QmbzW4DyDBi82MncUFyCCX32EdgLNhdAArXrxLXaM3VkTb/97.png`
    ],
    useSuspense: false,
  })

  return (
    <div>
      <h5>using hooks</h5>
      {isLoading && <div>Loading... (rand={rand})</div>}
      {error && <div>Error! {error.msg}</div>}
      {src && <img src={src} />}
      {!isLoading && !error && !src && <div>Nothing to show</div>}
    </div>
  )
}

const HooksSuspenseExample = ({ rand }) => {
  const { src, isLoading, error } = useImage({
    srcList: [
      'https://www.example.com/foo.jpg',
      `http://deelay.me/${rand * 1000}/https://picsum.photos/200`, // will be loaded
    ],
  })

  return (
    <div>
      <h5>using hooks & suspense</h5>
      <img src={src} />
    </div>
  )
}

function App() {
  const imageOn404 =
    'https://i9.ytimg.com/s_p/OLAK5uy_mwasty2cJpgWIpr61CqWRkHIT7LC62u7s/sddefault.jpg?sqp=CJz5ye8Fir7X7AMGCNKz4dEF&rs=AOn4CLC-JNn9jj-oFw94oM574w36xUL1iQ&v=5a3859d2'
  const tmdbImg =
    'https://image.tmdb.org/t/p/w500/kqjL17yufvn9OVLyXYpvtyrFfask.jpg'

  // http://i.imgur.com/ozEaj1Z.jpg
  const rand1 = randSeconds(1, 8)
  const rand2 = randSeconds(2, 10)
  const rand3 = randSeconds(2, 10)
  const rand4 = randSeconds(2, 5)

  return (
    <>

      <div>
        <h5>Hooks Legacy</h5>
        <HooksLegacyExample rand={rand4} />
      </div>
    </>
  )
}

const node = document.createElement('div')
node.id = 'root'
document.body.appendChild(node)
const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
