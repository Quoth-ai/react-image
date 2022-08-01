import React, { useState } from 'react'
import imagePromiseFactory from './imagePromiseFactory'

export type useImageProps = {
  srcList: string | string[]
  imgPromise?: (...args: any[]) => Promise<void>
  useSuspense?: boolean,
  loadTimeout?: number | null
}

const removeBlankArrayElements = (a) => a.filter((x) => x)
const stringToArray = (x) => (Array.isArray(x) ? x : [x])
const cache = {}

// sequential map.find for promises
const promiseFind = (arr, promiseFactory) => {
  const srcLength = arr.length;
  let done = false
  return new Promise((resolve, reject) => {
    const queueNext = (src, isLastSrc) => {
      return promiseFactory(src, isLastSrc).then(() => {
        done = true
        resolve(src)
      })
    }
    arr
      .reduce((p, src, index) => {
        // ensure we aren't done before enquing the next source
        return p.catch(() => {
          // index + 1 because we start operation from second item of array 
          const isLasutSrc = index + 1 === srcLength - 1
          if (!done) return queueNext(src, isLasutSrc)
        })
      }, queueNext(arr.shift(), srcLength === 1))
      .catch(reject)
  })
}

export default function useImage({
  srcList,
  imgPromise,
  useSuspense = true,
  loadTimeout
}: useImageProps): { src: string | undefined; isLoading: boolean; error: any } {
  const imgLoadPromise = imgPromise ?? imagePromiseFactory({ decode: true, loadTimeout })
  const [, setIsLoading] = useState(true)
  const sourceList = removeBlankArrayElements(stringToArray(srcList))
  const sourceKey = sourceList.join('')

  if (!cache[sourceKey]) {
    // create promise to loop through sources and try to load one
    cache[sourceKey] = {
      promise: promiseFind(sourceList, imgLoadPromise),
      cache: 'pending',
      error: null,
    }
  }

  // when promise resolves/reject, update cache & state
  cache[sourceKey].promise
    // if a source was found, update cache
    // when not using suspense, update state to force a rerender
    .then((src) => {
      cache[sourceKey] = { ...cache[sourceKey], cache: 'resolved', src }
      if (!useSuspense) setIsLoading(false)
    })

    // if no source was found, or if another error occured, update cache
    // when not using suspense, update state to force a rerender
    .catch((error) => {
      cache[sourceKey] = { ...cache[sourceKey], cache: 'rejected', error }
      if (!useSuspense) setIsLoading(false)
    })

  if (cache[sourceKey].cache === 'resolved') {
    return { src: cache[sourceKey].src, isLoading: false, error: null }
  }

  if (cache[sourceKey].cache === 'rejected') {
    if (useSuspense) throw cache[sourceKey].error
    return { isLoading: false, error: cache[sourceKey].error, src: undefined }
  }

  // cache[sourceKey].cache === 'pending')
  if (useSuspense) throw cache[sourceKey].promise
  return { isLoading: true, src: undefined, error: null }
}
