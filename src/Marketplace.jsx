import { useEffect, useState } from 'react'
import './Marketplace.css'

const ACCOUNT_KEY = 'bite-marketplace-account'
const SESSION_KEY = 'bite-marketplace-session'

const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Drinks', 'Coffee', 'Bakery', 'Snacks', 'Maldivian Food', 'Fast Food', 'Healthy Food']

const drops = [
  { name: 'Coconut chicken curry', kitchen: 'Island Table', category: 'Maldivian Food', time: 'Today, 7:30 PM', price: '$14', spots: '8 spots left', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', color: 'orange' },
  { name: 'Miso butter ramen', kitchen: 'Kumo House', category: 'Dinner', time: 'Tonight, 8:00 PM', price: '$16', spots: '12 bowls left', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85', color: 'pink' },
  { name: 'Mango sticky rice', kitchen: 'Sundown Sweets', category: 'Desserts', time: 'Tomorrow, 6:00 PM', price: '$9', spots: '5 boxes left', image: 'https://images.unsplash.com/photo-1621293954908-907159247fc8?auto=format&fit=crop&w=900&q=85', color: 'yellow' },
  { name: 'Charred corn tacos', kitchen: 'Late Lunch Club', category: 'Lunch', time: 'Today, 1:00 PM', price: '$12', spots: '20 spots left', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=85', color: 'blue' },
  { name: 'Cardamom cold brew', kitchen: 'Drift Coffee', category: 'Coffee', time: 'Ready now', price: '$6', spots: '18 cups left', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=85', color: 'purple' },
  { name: 'Warm sourdough loaf', kitchen: 'The Starter', category: 'Bakery', time: 'Tomorrow, 9:00 AM', price: '$8', spots: '6 loaves left', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85', color: 'green' },
]

function Marketplace() {
  const [activeView, setActiveView] = useState('feed')
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [savedDrops, setSavedDrops] = useState([])
  const [notice, setNotice] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [account, setAccount] = useState(() => JSON.parse(window.localStorage.getItem(ACCOUNT_KEY) || 'null'))
  const [isAuthenticated, setIsAuthenticated] = useState(() => window.localStorage.getItem(SESSION_KEY) === 'true')
  const [authError, setAuthError] = useState('')
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState(() => JSON.parse(window.localStorage.getItem('bite-marketplace-orders') || '[]'))
  const [showCart, setShowCart] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [timeLabel, setTimeLabel] = useState('')
  const [location, setLocation] = useState({ label: 'Finding your location...', latitude: null, longitude: null })

  useEffect(() => {
    const updateTime = () => setTimeLabel(new Intl.DateTimeFormat('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(new Date()))
    updateTime()
    const timer = window.setInterval(updateTime, 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return undefined
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      let label = `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`)
        const data = await response.json()
        const place = data.address?.city || data.address?.town || data.address?.village || data.address?.county
        const region = data.address?.state
        if (place) label = region ? `${place}, ${region}` : place
      } catch { /* Coordinates remain the reliable fallback. */ }
      setLocation({ label, latitude: coords.latitude, longitude: coords.longitude })
    }, () => setLocation({ label: 'Location unavailable', latitude: null, longitude: null }), { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
    return undefined
  }, [])

  const filteredDrops = drops.filter((drop) => {
    const matchesCategory = activeCategory === 'All' || drop.category === activeCategory
    const searchText = `${drop.name} ${drop.kitchen} ${drop.category}`.toLowerCase()
    return matchesCategory && searchText.includes(searchTerm.trim().toLowerCase())
  })

  const saveDrop = (drop) => {
    setSavedDrops((current) => current.includes(drop.name) ? current.filter((name) => name !== drop.name) : [...current, drop.name])
    setNotice(savedDrops.includes(drop.name) ? 'Removed from your drops' : 'Saved to your drops')
    window.setTimeout(() => setNotice(''), 1800)
  }

  const addToCart = (drop) => {
    setCart((current) => {
      const existing = current.find((item) => item.name === drop.name)
      return existing ? current.map((item) => item.name === drop.name ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...drop, quantity: 1 }]
    })
    setNotice(`${drop.name} added to cart`)
    window.setTimeout(() => setNotice(''), 1800)
  }

  const updateQuantity = (name, delta) => setCart((current) => current.map((item) => item.name === name ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0))

  const submitAuth = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim().toLowerCase()
    const password = String(formData.get('password'))
    if (authMode === 'signup') {
      const name = String(formData.get('name')).trim()
      const confirm = String(formData.get('confirm')).trim()
      if (password.length < 8 || password !== confirm) {
        setAuthError(password.length < 8 ? 'Use at least 8 characters.' : 'Passwords do not match.')
        return
      }
      const nextAccount = { name, email, password }
      window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextAccount))
      setAccount(nextAccount)
    } else if (!account || account.email !== email || account.password !== password) {
      setAuthError('Email or password is not recognised.')
      return
    }
    window.localStorage.setItem(SESSION_KEY, 'true')
    setIsAuthenticated(true)
    setAuthError('')
  }

  const placeOrder = () => {
    if (!cart.length) return
    const total = cart.reduce((sum, item) => sum + Number.parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2)
    const lines = cart.map((item) => `${item.quantity}x ${item.name}`).join('\n')
    const locationLine = location.latitude === null ? 'Google Maps: Location unavailable' : `Google Maps: https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    const message = `New Bite order\n\n${lines}\n\nTotal: $${total}\nCustomer: ${account?.name || 'Bite customer'}\n${locationLine}`
    const nextOrder = { id: `BITE-${Date.now().toString().slice(-6)}`, lines, total, status: 'Sent to kitchen', createdAt: new Date().toISOString() }
    const nextOrders = [nextOrder, ...orders]
    setOrders(nextOrders)
    window.localStorage.setItem('bite-marketplace-orders', JSON.stringify(nextOrders))
    window.open(`https://wa.me/919477230786?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setCart([])
    setShowCart(false)
    setOrderComplete(true)
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const renderFeed = () => (
    <>
      <section className="hero-copy">
        <span className="eyebrow">Live marketplace</span>
        <h1>Food drops<br /><em>near you.</em></h1>
        <p>Swipe-style discovery for local kitchens, limited batches, preorder drops and late-night cravings.</p>
      </section>
      <div className="search-wrap"><span aria-hidden="true">⌕</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Food, stores, categories..." aria-label="Search food, stores, categories" />{searchTerm && <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search">×</button>}</div>
      <div className="category-scroller" aria-label="Food categories">{categories.map((category) => <button key={category} type="button" className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
      <section className="feed" aria-label="Food feed">
        <div className="section-heading"><div><span className="eyebrow">Freshly posted</span><h2>Tonight's drops</h2></div><span className="feed-count">{filteredDrops.length} drops</span></div>
        {filteredDrops.length ? <div className="drop-grid">{filteredDrops.map((drop, index) => <article className="drop-card" key={drop.name} style={{ '--delay': `${index * 70}ms` }}><div className="drop-image"><img src={drop.image} alt={drop.name} /><span className="drop-time">{drop.time}</span><button type="button" className={savedDrops.includes(drop.name) ? 'saved' : ''} onClick={() => saveDrop(drop)} aria-label={`${savedDrops.includes(drop.name) ? 'Remove' : 'Save'} ${drop.name}`}>{savedDrops.includes(drop.name) ? '♥' : '♡'}</button></div><div className="drop-body"><span className="drop-kitchen">{drop.kitchen} <i>•</i> {drop.category}</span><h3>{drop.name}</h3><div className="drop-meta"><strong>{drop.price}</strong><span>{drop.spots}</span></div><button type="button" className="add-button" onClick={() => addToCart(drop)}>Add to cart <span>+</span></button></div></article>)}</div> : <div className="empty-feed"><span>⌕</span><h2>Couldn't find that drop.</h2><p>Try another search or category.</p></div>}
      </section>
    </>
  )

  const renderStores = () => <section className="simple-view"><span className="eyebrow">The local list</span><h1>Good food<br /><em>has a postcode.</em></h1><p>Browse the kitchens, bakers and coffee spots making something worth leaving home for.</p><div className="store-list">{[...new Set(drops.map((drop) => drop.kitchen))].map((kitchen, index) => <div className="store-row" key={kitchen}><span>0{index + 1}</span><strong>{kitchen}</strong><span>{drops.filter((drop) => drop.kitchen === kitchen).length} drop</span></div>)}</div></section>

  const renderOrders = () => <section className="simple-view orders-view"><span className="eyebrow">Your history</span><h1>Every order<br /><em>has a story.</em></h1>{orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div><span>{order.id}</span><strong>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}</strong></div><p>{order.lines}</p><footer><b>{order.status}</b><strong>${order.total}</strong></footer></article>)}</div> : <div className="empty-feed"><span>◷</span><h2>No orders yet.</h2><p>Your successful orders will appear here.</p></div>}</section>

  const renderProfile = () => <section className="simple-view profile-view"><span className="profile-badge">{savedDrops.length || '0'}</span><span className="eyebrow">Your corner</span><h1>Keep the<br /><em>good stuff.</em></h1><p>{account ? `Welcome back, ${account.name || account.email}.` : 'Create an account to save drops and track orders.'}</p><p>{savedDrops.length ? `You have ${savedDrops.length} saved ${savedDrops.length === 1 ? 'drop' : 'drops'} waiting.` : 'Save a drop from the feed and it will show up here.'}</p><button type="button" className="primary-button" onClick={() => { window.localStorage.removeItem(SESSION_KEY); setIsAuthenticated(false) }}>Log out <span>↗</span></button></section>

  if (!isAuthenticated) return <main className="auth-shell"><section className="auth-card"><a className="logo" href="/">bite<span>.</span></a><span className="eyebrow">A better way to eat</span><h1>{authMode === 'login' ? <>Welcome<br /><em>back.</em></> : <>Make room<br /><em>for more.</em></>}</h1><p>{authMode === 'login' ? 'Log in to discover your next favorite bite.' : 'Create an account to save drops and order faster.'}</p><div className="auth-tabs"><button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError('') }}>Log in</button><button type="button" className={authMode === 'signup' ? 'active' : ''} onClick={() => { setAuthMode('signup'); setAuthError('') }}>Sign up</button></div><form className="auth-form" onSubmit={submitAuth} autoComplete="on">{authMode === 'signup' && <label>Name<input name="name" autoComplete="name" required /></label>}<label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength="8" required /></label>{authMode === 'signup' && <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" minLength="8" required /></label>}{authError && <small className="auth-error">{authError}</small>}<button type="submit">{authMode === 'login' ? 'Log in' : 'Create account'} <span>↗</span></button></form><small className="auth-note">Your account is remembered on this device. Password Manager may offer to save your login.</small></section><nav className="mobile-nav auth-nav" aria-label="Main navigation"><button type="button" className="active" onClick={() => setAuthError('Log in to open the main feed')}><span>⌂</span>Main</button><button type="button" onClick={() => setAuthError('Log in to open your cart')}><span>▱</span>Cart</button><button type="button" onClick={() => setAuthError('Log in to open your profile')}><span>◉</span>Profile</button><button type="button" onClick={() => setAuthError('Log in to view your orders')}><span>◷</span>Orders</button></nav></main>

  return <main className="marketplace-shell"><div className="grain" /><header className="site-header"><a className="logo" href="/" onClick={(event) => { event.preventDefault(); setActiveView('feed') }}>bite<span>.</span></a><div className="header-actions"><span className="live-dot">● {timeLabel}</span><button type="button" className="cart-button" onClick={() => setShowCart(true)} aria-label="Open cart">Cart <b>{cartCount}</b></button><button type="button" className="profile-button" onClick={() => setActiveView('profile')} aria-label="Open profile">{account?.name?.[0] || 'A'}</button></div></header><div className="location-strip">⌖ {location.label} <span>{timeLabel}</span></div><div className="page-content">{activeView === 'feed' ? renderFeed() : activeView === 'stores' ? renderStores() : activeView === 'orders' ? renderOrders() : renderProfile()}</div><footer className="site-footer"><span>Made for hungry island nights.</span><a href="/admin/login">Admin</a></footer><nav className="mobile-nav" aria-label="Main navigation"><button type="button" className={activeView === 'feed' ? 'active' : ''} onClick={() => { setActiveView('feed'); setShowCart(false) }}><span>⌂</span>Main</button><button type="button" className={showCart ? 'active' : ''} onClick={() => setShowCart(true)}><span>▱</span>Cart {cartCount > 0 && <b>{cartCount}</b>}</button><button type="button" className={activeView === 'profile' ? 'active' : ''} onClick={() => setActiveView('profile')}><span>◉</span>Profile</button><button type="button" className={activeView === 'orders' ? 'active' : ''} onClick={() => { setActiveView('orders'); setShowCart(false) }}><span>◷</span>Orders</button></nav>{notice && <div className="notice" role="status">{notice}</div>}{showCart && <aside className="cart-drawer" aria-label="Your cart"><button type="button" className="drawer-close" onClick={() => setShowCart(false)} aria-label="Close cart">×</button><span className="eyebrow">Your order</span><h2>Cart <em>{cartCount}</em></h2>{cart.length ? <>{cart.map((item) => <div className="cart-row" key={item.name}><span>{item.name}<small>{item.price}</small></span><div><button type="button" onClick={() => updateQuantity(item.name, -1)}>-</button><b>{item.quantity}</b><button type="button" onClick={() => updateQuantity(item.name, 1)}>+</button></div></div>)}<div className="cart-total"><span>Total</span><strong>${cart.reduce((sum, item) => sum + Number.parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2)}</strong></div><button type="button" className="checkout-button" onClick={placeOrder}>Place order via WhatsApp <span>↗</span></button></> : <p className="cart-empty">Your cart is waiting for something delicious.</p>}</aside>}{orderComplete && <div className="success-modal"><span>✓</span><h2>Order successful</h2><p>Your order is on its way to WhatsApp. The kitchen will confirm it shortly.</p><button type="button" onClick={() => setOrderComplete(false)}>Done</button></div>}</main>
}

export default Marketplace
