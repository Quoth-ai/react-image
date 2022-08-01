// returns a Promisized version of Image() api
export default ({ decode = true, crossOrigin = '', loadTimeout }) =>
  (src: string, isLastSrc: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      const i = new Image();
      let timer;
      if (crossOrigin) i.crossOrigin = crossOrigin
      i.onload = () => {
        clearTimeout(timer)
        decode && i.decode ? i.decode().then(resolve).catch(reject) : resolve()
      }
      i.onerror = reject
      i.src = src
      if (loadTimeout && !isLastSrc) {
        timer = setTimeout(() => {
          i.src = ''
          reject()
        }, loadTimeout)
      }
    })
  }
