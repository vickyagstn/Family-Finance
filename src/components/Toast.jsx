function Toast({ message, type }) {
    if (!message) return null
  
    return (
      <div className={`toast ${type}`}>
        <div className="toast-icon">{type === 'success' ? '✅' : '⚠️'}</div>
        <div className="toast-text">{message}</div>
      </div>
    )
  }
  
  export default Toast