import { useEffect, useRef, useState } from 'react'
import './App.css'

const dishes = [
  { name: 'Truffle smash burger', place: 'Goldie’s', meta: '25 min · 4.8', price: '$18.50', tag: 'Most loved', color: 'sage', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Spicy miso ramen', place: 'Kumo House', meta: '30 min · 4.9', price: '$16.00', tag: 'New in', color: 'coral', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Green goddess bowl', place: 'Good Habit', meta: '20 min · 4.7', price: '$14.75', tag: 'Fresh pick', color: 'lime', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Burrata sourdough', place: 'Little Roma', meta: '22 min · 4.8', price: '$15.25', tag: 'Trending', color: 'peach', image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Crispy salmon tacos', place: 'Maré', meta: '28 min · 4.6', price: '$17.00', tag: 'Worth a bite', color: 'blue', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Firecracker chicken', place: 'Fennel & Co.', meta: '18 min · 4.7', price: '$17.75', tag: 'Spicy', color: 'coral', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Citrus poke bowl', place: 'Harbor', meta: '24 min · 4.9', price: '$16.50', tag: 'Fresh', color: 'lime', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Garden lasagna', place: 'Aster Kitchen', meta: '32 min · 4.8', price: '$19.00', tag: 'Cozy', color: 'sage', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Mango chilli tacos', place: 'Sunset Taco', meta: '15 min · 4.7', price: '$13.50', tag: 'Snackable', color: 'peach', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Wagyu udon', place: 'Northlane', meta: '26 min · 4.9', price: '$20.25', tag: 'Chef pick', color: 'blue', image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Lemon herb rice', place: 'Sage & Salt', meta: '21 min · 4.6', price: '$12.75', tag: 'Comfort', color: 'lime', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Crispy tofu bao', place: 'Bloom Bites', meta: '19 min · 4.8', price: '$14.25', tag: 'Vegan', color: 'sage', image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Smoked brisket toast', place: 'Marlow', meta: '17 min · 4.7', price: '$18.25', tag: 'Brunch', color: 'peach', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Korean fried chicken', place: 'Seoul Fold', meta: '23 min · 4.9', price: '$19.50', tag: 'Crowd fave', color: 'coral', image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Berry parfait', place: 'Sunpeak', meta: '12 min · 4.5', price: '$9.75', tag: 'Sweet', color: 'blue', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Wild mushroom pasta', place: 'Rookery', meta: '29 min · 4.8', price: '$18.75', tag: 'Earthy', color: 'sage', image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1000&q=85' },
]

const themes = [
  { id: 'citrus', name: 'Citrus club', detail: 'Fresh + punchy', swatch: '#ff704c' },
  { id: 'berry', name: 'Berry dusk', detail: 'Soft + electric', swatch: '#e65375' },
  { id: 'tide', name: 'Tidal mint', detail: 'Cool + crisp', swatch: '#1c9a9a' },
]

const ACCOUNT_STORAGE_KEY = 'bite-accounts'
const SESSION_STORAGE_KEY = 'bite-session'

const hashPassword = async (password) => {
  const encodedPassword = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedPassword)
  return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const readAccounts = () => {
  try {
    return JSON.parse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5)

const getNextDish = (cards) => {
  const usedNames = new Set(cards.slice(0, 5).map((dish) => dish.name))
  const available = dishes.filter((dish) => !usedNames.has(dish.name))
  const pool = available.length ? available : dishes
  return pool[Math.floor(Math.random() * pool.length)]
}

function App() {
  const [deck, setDeck] = useState(() => shuffle(dishes))
  const [cart, setCart] = useState([])
  const [activeTab, setActiveTab] = useState('discover')
  const [searchTerm, setSearchTerm] = useState('')
  const [notice, setNotice] = useState('')
  const [dragX, setDragX] = useState(0)
  const [locationLabel, setLocationLabel] = useState('Brooklyn, NY')
  const [userCoordinates, setUserCoordinates] = useState(null)
  const [timeLabel, setTimeLabel] = useState('')
  const [isLaunched, setIsLaunched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAppSplash, setShowAppSplash] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => window.localStorage.getItem(SESSION_STORAGE_KEY) === 'true')
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('citrus')
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const startX = useRef(0)
  const lastTap = useRef(0)
  const locationWatcher = useRef(null)
  const matchingDishes = dishes.filter((dish) => {
    const searchText = `${dish.name} ${dish.place} ${dish.tag}`.toLowerCase()
    return searchText.includes(searchTerm.trim().toLowerCase())
  })
  const visibleDeck = searchTerm.trim() ? matchingDishes : deck
  const current = visibleDeck[0]
  const orderEtaMinutes = cart.length
    ? Math.max(...cart.map((item) => Number.parseInt(item.meta, 10) || 0)) + 10
    : 0

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 1800)
    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const updateTimeLabel = () => {
      const now = new Date()
      const value = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
      }).format(now)
      setTimeLabel(value)
    }

    updateTimeLabel()
    const timer = window.setInterval(updateTimeLabel, 60000)
    return () => window.clearInterval(timer)
  }, [])

  const moveCard = (direction) => {
    setDragX(0)
    setDeck((cards) => {
      if (!cards.length) return shuffle(dishes)
      const [first, ...rest] = cards
      return [...rest, getNextDish([first, ...rest])]
    })
    setNotice(direction === 'like' ? 'Saved for later' : 'Finding your next bite')
  }

  const addToCart = () => {
    if (!current) return
    setCart((items) => {
      const itemExists = items.find((item) => item.name === current.name)
      if (itemExists) {
        return items.map((item) => item.name === current.name ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...items, { ...current, quantity: 1 }]
    })
    setNotice(`${current.name} added to cart`)
  }

  const updateQuantity = (name, delta) => {
    setCart((items) =>
      items
        .map((item) => item.name === name ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (name) => {
    setCart((items) => items.filter((item) => item.name !== name))
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthBusy(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim().toLowerCase()
    const password = String(formData.get('password') || '')
    const accounts = readAccounts()

    try {
      const passwordHash = await hashPassword(password)

      if (authMode === 'signup') {
        const name = String(formData.get('name') || '').trim()
        const confirmPassword = String(formData.get('confirmPassword') || '')
        if (password !== confirmPassword) {
          setAuthError('Passwords do not match.')
          return
        }
        if (accounts.some((account) => account.email === email)) {
          setAuthError('An account already exists for this email.')
          return
        }
        accounts.push({ email, name, passwordHash })
        window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts))
      } else {
        const account = accounts.find((storedAccount) => storedAccount.email === email)
        if (!account || account.passwordHash !== passwordHash) {
          setAuthError('That email or password is not recognised.')
          return
        }
      }

      window.localStorage.setItem(SESSION_STORAGE_KEY, 'true')
      setIsAuthenticated(true)
    } catch {
      setAuthError('Unable to save your account on this device.')
    } finally {
      setAuthBusy(false)
    }
  }

  const placeOrder = () => {
    if (!cart.length) {
      setNotice('Your cart is empty')
      return
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cart.reduce((sum, item) => sum + Number.parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2)
    const orderLines = cart.map((item) => `${item.quantity}x ${item.name}`).join('\n')
    const locationDetails = userCoordinates
      ? `Driver location: ${userCoordinates.latitude.toFixed(6)}, ${userCoordinates.longitude.toFixed(6)}\nGoogle Maps: https://www.google.com/maps?q=${userCoordinates.latitude},${userCoordinates.longitude}`
      : 'Driver location: unavailable'
    const message = `New Bite order\n\n${orderLines}\n\nTotal: $${subtotal}\nEstimated arrival: about ${orderEtaMinutes} min\n\n${locationDetails}`
    window.open(`https://wa.me/919477230786?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setNotice(`Order placed for ${totalItems} item${totalItems > 1 ? 's' : ''}`)
    setCart([])
    setActiveTab('discover')
  }

  const handleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 350) addToCart()
    lastTap.current = now
  }

  const handlePointerDown = (event) => {
    startX.current = event.clientX
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event) => {
    const distance = event.clientX - startX.current
    if (Math.abs(distance) > 70) moveCard(distance > 0 ? 'like' : 'skip')
  }

  const resolveLocation = async (latitude, longitude) => {
    setUserCoordinates({ latitude, longitude })
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
      if (!response.ok) throw new Error('Location lookup failed')
      const data = await response.json()
      const place = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || data.address?.county || 'Current location'
      const region = data.address?.state || data.address?.region
      setLocationLabel(region ? `${place}, ${region}` : place)
    } catch {
      setLocationLabel(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`)
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDeck((cards) => {
        if (!cards.length) return shuffle(dishes)
        const [first, ...rest] = cards
        return [...rest, getNextDish([first, ...rest])]
      })
    }, 4500)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLabel('Location unavailable')
      return
    }

    setLocationLabel('Locating...')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await resolveLocation(coords.latitude, coords.longitude)
      },
      (error) => {
        setLocationLabel('Location unavailable')
        setNotice(error.code === error.PERMISSION_DENIED ? 'Location access denied' : 'Unable to find your location')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }, [])

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationLabel('Location unavailable')
      setNotice('GPS is not supported on this device')
      return
    }

    if (locationWatcher.current !== null) {
      navigator.geolocation.clearWatch(locationWatcher.current)
    }

    setLocationLabel('Locating...')
    setNotice('Finding your location')

    locationWatcher.current = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        await resolveLocation(coords.latitude, coords.longitude)
        navigator.geolocation.clearWatch(locationWatcher.current)
        locationWatcher.current = null
      },
      (error) => {
        setLocationLabel('Location unavailable')
        setNotice(error.code === error.PERMISSION_DENIED ? 'Location access denied' : 'Unable to find your location')
        if (locationWatcher.current !== null) {
          navigator.geolocation.clearWatch(locationWatcher.current)
          locationWatcher.current = null
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="app-shell auth-shell">
        <section className="auth-card" aria-label="Bite sign in">
          <div className="auth-mark">bite<span>.</span></div>
          <div className="auth-kicker-row"><p className="auth-kicker">A better way to eat</p><span className="auth-status">On this device</span></div>
          <h1>{authMode === 'login' ? <>Welcome<br /><em>back.</em></> : <>Make room<br /><em>for more.</em></>}</h1>
          <p className="auth-intro">{authMode === 'login' ? 'Sign in to find your next favorite bite.' : 'Create your Bite account and keep your table close.'}</p>
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={authMode === 'login'} className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError('') }}>Log in</button>
            <button type="button" role="tab" aria-selected={authMode === 'signup'} className={authMode === 'signup' ? 'active' : ''} onClick={() => { setAuthMode('signup'); setAuthError('') }}>Create account</button>
          </div>
          <form key={authMode} className="auth-form auth-form-switch" onSubmit={handleAuthSubmit} autoComplete="on">
            {authMode === 'signup' && <label>First name<input name="name" type="text" autoComplete="given-name" placeholder="Rehan" required /></label>}
            <label>Email address<input name="email" type="email" autoComplete="username" placeholder="you@example.com" required /></label>
            <label>Password<input name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••" minLength="8" required /></label>
            {authMode === 'signup' && <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" minLength="8" required /></label>}
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            <button type="submit" disabled={authBusy}>{authBusy ? 'Saving your seat...' : authMode === 'login' ? 'Enter Bite' : 'Create my account'} <span>↗</span></button>
          </form>
          <small className="auth-footnote">Your table is waiting. Password Manager may ask to save your login.</small>
        </section>
      </main>
    )
  }

  if (!isLaunched) {
    const launchApps = [
      { name: 'Photos', icon: '◔', className: 'mini-one' },
      { name: 'Messages', icon: '✉', className: 'mini-two' },
      { name: 'Music', icon: '♫', className: 'mini-three' },
      { name: 'Safari', icon: '◌', className: 'mini-four' },
      { name: 'Bite', icon: 'b', className: 'bite-app', isLaunch: true },
      { name: 'Health', icon: '♥', className: 'mini-five' },
      { name: 'Maps', icon: '⌖', className: 'mini-six' },
      { name: 'Camera', icon: '◍', className: 'mini-seven' },
      { name: 'Notes', icon: '✎', className: 'mini-eight' },
    ]

    return (
      <main className="app-shell ios-launcher">
        {isLoading && (
          <div className="app-loading-screen" aria-live="polite">
            <div className="loading-bite">bite<span>.</span></div>
            <div className="loading-bar"><span /></div>
          </div>
        )}

        <div className="device-frame">
          <div className="lock-status-bar">
            <span>9:41</span>
            <span>◔◔◔</span>
          </div>

          <div className="launch-screen">
            <div className="weather-widget">
              <div className="weather-topline">
                <span>San Francisco</span>
                <span className="weather-temp">53°</span>
              </div>
              <div className="weather-row">
                <span>Partly Cloudy</span>
                <span>H 60° • L 54°</span>
              </div>
              <div className="weather-avatar">M</div>
            </div>

            <div className="app-grid" aria-label="App icons">
              {launchApps.map((app) => (
                app.isLaunch ? (
                  <button key={app.name} type="button" className={`mini-app ${app.className} app-launch`} onClick={() => {
                    setIsLoading(true)
                    window.setTimeout(() => {
                      setShowAppSplash(true)
                      setIsLoading(false)
                      window.setTimeout(() => {
                        setIsLaunched(true)
                        setShowAppSplash(false)
                      }, 1200)
                    }, 500)
                  }} aria-label="Open Bite app">
                    <span className="launch-bite">bite<span>.</span></span>
                  </button>
                ) : (
                  <button key={app.name} type="button" className={`mini-app ${app.className}`} aria-label={app.name}>{app.icon}</button>
                )
              ))}
            </div>

            <div className="dock-row" aria-label="Dock apps">
              <button type="button" className="dock-app dock-one" aria-label="Phone">☎</button>
              <button type="button" className="dock-app dock-two" aria-label="Mail">✉</button>
              <button type="button" className="dock-app dock-three" aria-label="Bite app" onClick={() => setIsLaunched(true)}><span className="dock-bite-mark">•</span></button>
              <button type="button" className="dock-app dock-four" aria-label="Compass">◌</button>
              <button type="button" className="dock-app dock-five" aria-label="Settings">⚙</button>
            </div>
          </div>

          <div className="home-indicator" />
        </div>
      </main>
    )
  }

  return (
    <main className={`app-shell theme-${selectedTheme}`}>
      {showAppSplash && (
        <div className="bite-app-splash" aria-live="polite">
          <div className="bite-splash-mark">bite<span>.</span></div>
          <div className="bite-splash-loader"><span /></div>
        </div>
      )}
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="phone" aria-label="Bite food delivery app">
        <div className="dynamic-island" />
        <header className="topbar">
          <span className="wordmark">bite<span>.</span></span>
          <button className="location" type="button" aria-label="Change location" onClick={requestLocation}>{locationLabel} <span>⌄</span></button>
          <button className="theme-toggle" type="button" aria-label="Choose a theme" aria-expanded={showThemeMenu} onClick={() => setShowThemeMenu((isOpen) => !isOpen)}>◒</button>
          <button className="avatar" type="button" aria-label="Open profile">A</button>
        </header>

        {showThemeMenu && <div className="theme-menu" role="dialog" aria-label="Choose a theme">
          <div className="theme-menu-heading"><span>Choose your mood</span><small>Tap to switch</small></div>
          <div className="theme-options">
            {themes.map((theme) => <button key={theme.id} type="button" className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`} onClick={() => {
              setSelectedTheme(theme.id)
              setShowThemeMenu(false)
            }}>
              <span className="theme-swatch" style={{ '--swatch': theme.swatch }} />
              <span><strong>{theme.name}</strong><small>{theme.detail}</small></span>
              {selectedTheme === theme.id && <b aria-label="Selected theme">✓</b>}
            </button>)}
          </div>
        </div>}

        <div className="content">
          {activeTab === 'discover' ? (
            <>
              <div className="intro"><div><p className="eyebrow">{timeLabel || 'Loading time...'}</p><h1>What are you<br /><em>feeling?</em></h1></div><button className="refresh" type="button" onClick={() => setDeck(shuffle(dishes))} aria-label="Shuffle food picks">↻</button></div>
              <label className="food-search"><span aria-hidden="true">⌕</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search food or restaurants" aria-label="Search food or restaurants" />{searchTerm && <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear food search">×</button>}</label>
              <div className="filter-row"><span>{searchTerm.trim() ? `${matchingDishes.length} bites found` : 'Curated for you'}</span><button type="button">Dinner <span>⌄</span></button></div>
              {visibleDeck.length ? (
                <>
                  <div className="deck" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onClick={handleTap} style={{ '--drag': `${dragX}px` }}>
                    {visibleDeck.slice(0, 3).reverse().map((dish, index) => <article className={`food-card card-${index}`} key={dish.name}>
                      <img src={dish.image} alt={dish.name} />
                      <div className="card-shade" /><span className={`pill ${dish.color}`}>{dish.tag}</span>
                      {index === 2 && <div className="dish-info"><p>{dish.place}</p><h2>{dish.name}</h2><div><span>{dish.meta}</span><strong>{dish.price}</strong></div></div>}
                    </article>)}
                  </div>
                  <p className="hint"><span>♡</span> double tap to add to your cart</p>
                  <div className="actions"><button type="button" className="action skip" onClick={() => moveCard('skip')} aria-label="Skip dish">×</button><button type="button" className="action love" onClick={addToCart} aria-label="Add dish to cart">♡</button><button type="button" className="action next" onClick={() => moveCard('like')} aria-label="Next dish">↗</button></div>
                </>
              ) : <div className="search-empty"><span>⌕</span><p>Not available.</p><small>That food is not on our list yet.</small></div>}
            </>
          ) : (
            <div className="cart-view">
              <p className="eyebrow">Your order</p>
              <h1>Cart <em>▱</em></h1>
              <p className="list-sub">Ready for pickup or delivery.</p>
              {cart.length ? (
                <>
                  <div className="delivery-estimate">
                    <span className="delivery-icon" aria-hidden="true">⌁</span>
                    <div><strong>Arrives in about {orderEtaMinutes} min</strong><small>We’ll bring your order while it’s fresh.</small></div>
                  </div>
                  {cart.map((dish) => (
                    <div className="list-item" key={dish.name}>
                      <img src={dish.image} alt="" />
                      <div>
                        <h2>{dish.name}</h2>
                        <p>{dish.place} · {dish.price}</p>
                      </div>
                      <div className="quantity-control" aria-label={`Adjust quantity for ${dish.name}`}>
                        <button type="button" onClick={() => updateQuantity(dish.name, -1)} aria-label={`Decrease quantity for ${dish.name}`}>−</button>
                        <span>{dish.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(dish.name, 1)} aria-label={`Increase quantity for ${dish.name}`}>＋</button>
                      </div>
                      <button type="button" aria-label={`Remove ${dish.name}`} onClick={() => removeFromCart(dish.name)}>×</button>
                    </div>
                  ))}
                  <div className="order-summary">
                    <div>
                      <span>Subtotal</span>
                      <strong>{`$${cart.reduce((sum, item) => sum + Number.parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2)}`}</strong>
                    </div>
                    <button type="button" className="checkout-button" onClick={placeOrder}>Order via WhatsApp</button>
                  </div>
                </>
              ) : (
                <div className="empty"><span>▱</span><p>Your cart is empty.</p><small>Add a few bites, then order.</small></div>
              )}
            </div>
          )}
        </div>
        {notice && <div className="toast">{notice}</div>}
        <nav className="tabbar"><button className={activeTab === 'discover' ? 'active' : ''} type="button" onClick={() => setActiveTab('discover')}><span>⌂</span>Discover</button><button className={activeTab === 'cart' ? 'active cart-tab' : 'cart-tab'} type="button" onClick={() => setActiveTab('cart')}><span>▱</span>Cart {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && <b>{cart.reduce((sum, item) => sum + item.quantity, 0)}</b>}</button></nav>
      </section>
      <aside className="desktop-note"><span className="note-mark">+</span><p>Swipe into something<br /><strong>delicious.</strong></p><small>A little food chemistry,<br />one tap at a time.</small></aside>
    </main>
  )
}

export default App
