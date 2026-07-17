function WelcomeBanner({ name = 'Admin' }) {
    const now = new Date()
    const jam = now.getHours()
    const sapaan = jam < 11 ? 'Selamat Pagi' : jam < 15 ? 'Selamat Siang' : jam < 18 ? 'Selamat Sore' : 'Selamat Malam'
    const tanggal = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  
    return (
      <div className="welcome-banner">
        <div className="wb-icon">💰</div>
        <h2>{sapaan}, {name}! 👋</h2>
        <p>Selamat datang di dashboard Family Finance</p>
        <span className="wb-date">{tanggal}</span>
      </div>
    )
  }
  
  export default WelcomeBanner