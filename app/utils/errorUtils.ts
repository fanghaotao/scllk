// 创建一个自定义的错误过滤器
export const setupErrorFilter = () => {
    if (typeof window === 'undefined') return
  
    const originalError = console.error
    const ignoredPatterns = [
      'chrome-extension',
      'solana.js',
      'Unexpected error',
      'bfnaelmomeimhlpmgjnjophhpkkoljpa'
    ]
  
    console.error = (...args: any[]) => {
      // 检查错误堆栈是否包含需要忽略的模式
      const errorString = JSON.stringify(args)
      if (ignoredPatterns.some(pattern => errorString.includes(pattern))) {
        return // 忽略匹配的错误
      }
  
      // 对于其他错误，使用原始的 console.error
      originalError.apply(console, args)
    }
  }