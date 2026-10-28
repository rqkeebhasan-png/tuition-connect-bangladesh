import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import type { FormEvent } from 'react'
import { faqs, popularClasses, popularSubjects } from './content'
import { getAppConfig } from './lib/env'
import { supabase } from './lib/supabase'

const navItems = [['/', 'হোম'], ['/find-tutor', 'টিউটর খুঁজুন'], ['/find-tuition', 'টিউশন খুঁজুন'], ['/how-it-works', 'কীভাবে কাজ করে'], ['/about', 'আমাদের সম্পর্কে']]

function Logo() {
  return <Link className="logo" to="/"><span className="logo-mark">TC</span><span>Tuition <b>Connect</b><small>বাংলাদেশ</small></span></Link>
}

function Header({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false)
  async function handleSignOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out failed:', error.message)
  }
  return <header className="site-header"><div className="container header-inner"><Logo /><button className="menu-button" aria-label="মেনু খুলুন" onClick={() => setOpen(!open)}>☰</button><nav className={open ? 'nav open' : 'nav'}>{navItems.map(([path, label]) => <Link key={path} to={path} onClick={() => setOpen(false)}>{label}</Link>)}{user ? <><Link className="button button-outline" to="/dashboard/tutor">ড্যাশবোর্ড</Link><button className="button button-primary" type="button" onClick={handleSignOut}>লগআউট</button></> : <><Link className="button button-outline" to="/login">লগইন</Link><Link className="button button-primary" to="/register">নিবন্ধন করুন</Link></>}</nav></div></header>
}

function Footer() {
  return <footer><div className="container footer-grid"><div><Logo /><p className="muted">শিক্ষার্থী, অভিভাবক ও টিউটরদের জন্য সহজ ও নির্ভরযোগ্য প্ল্যাটফর্ম।</p></div><div><h3>দ্রুত লিংক</h3><Link to="/find-tutor">টিউটর খুঁজুন</Link><Link to="/find-tuition">টিউশন খুঁজুন</Link><Link to="/safety">নিরাপত্তা নির্দেশিকা</Link></div><div><h3>সহায়তা</h3><Link to="/faq">সাধারণ প্রশ্ন</Link><Link to="/contact">যোগাযোগ</Link><Link to="/privacy">গোপনীয়তা নীতি</Link></div></div><div className="container footer-bottom">© ২০২৬ Tuition Connect Bangladesh · এই প্ল্যাটফর্মের live backend এখনো সংযুক্ত নয়।</div></footer>
}

function Layout({ children, user }: { children: React.ReactNode; user: User | null }) { return <><Header user={user} /><main>{children}</main><Footer /></> }
function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) { return <div className="section-title">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{text && <p>{text}</p>}</div> }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="empty-state"><div className="empty-icon">✦</div><h3>{title}</h3><p>{text}</p></div> }

type TutorRow = {
  id: string
  headline: string
  bio: string | null
  subjects: string[]
  classes: string[]
  location: string
  hourly_rate: number | null
  is_verified: boolean
  profiles: { full_name: string | null }[] | null
}

type TuitionRow = {
  id: string
  title: string
  description: string | null
  subject: string
  class_level: string
  location: string
  schedule: string | null
  budget: number | null
  created_at: string
}

function Home() {
  return <><section className="hero"><div className="container hero-grid"><div><span className="eyebrow">বাংলাদেশের টিউশন প্ল্যাটফর্ম</span><h1>সঠিক টিউটর খুঁজুন,<br /><em>সফলতার পথে</em> এগিয়ে যান</h1><p className="hero-text">শিক্ষার্থী, অভিভাবক ও টিউটরদের জন্য সহজ, নিরাপদ এবং নির্ভরযোগ্য সংযোগ।</p><div className="hero-actions"><Link className="button button-primary" to="/find-tutor">টিউটর খুঁজুন <span>→</span></Link><Link className="button button-soft" to="/find-tuition">টিউশন খুঁজুন</Link></div><div className="trust-note"><span>✓</span> আপনার গোপনীয়তা আমাদের অগ্রাধিকার</div></div><div className="hero-card"><div className="hero-card-top"><span className="status-dot" /> নিরাপদ সংযোগ</div><div className="hero-illustration"><div className="book">📚</div><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="spark">✦</div></div><p>জ্ঞান ভাগাভাগি হোক, ভবিষ্যৎ গড়ে উঠুক</p></div></div></section><section className="search-panel container"><div className="search-tabs"><b>আপনি কী খুঁজছেন?</b><Link to="/find-tutor">টিউটর</Link><Link to="/find-tuition">টিউশন</Link></div><div className="search-fields"><label>বিষয়<input placeholder="যেমন: গণিত" /></label><label>শ্রেণি<select defaultValue=""><option value="" disabled>শ্রেণি নির্বাচন করুন</option>{popularClasses.map(item => <option key={item}>{item}</option>)}</select></label><label>অবস্থান<input placeholder="জেলা বা এলাকা" /></label><Link className="button button-primary search-button" to="/find-tutor">অনুসন্ধান করুন</Link></div></section><section className="section container"><SectionTitle eyebrow="জনপ্রিয় ক্যাটাগরি" title="আপনার প্রয়োজন অনুযায়ী খুঁজুন" text="আপনার পছন্দের বিষয় বা শ্রেণি দিয়ে শুরু করুন।" /><div className="chip-grid">{popularSubjects.map((item, index) => <Link to="/find-tutor" className="category-card" key={item}><span className={`category-icon icon-${index}`}>✦</span><b>{item}</b><small>টিউটর খুঁজুন →</small></Link>)}</div></section><section className="section section-tint"><div className="container"><SectionTitle eyebrow="সাম্প্রতিক টিউশন" title="আপনার জন্য অপেক্ষায়" text="বাস্তব টিউশন পোস্ট প্রকাশিত হলে এখানে দেখা যাবে।" /><EmptyState title="এখনো কোনো টিউশন পোস্ট নেই" text="ডেটাবেস সংযুক্ত হলে নতুন টিউশন পোস্টগুলো এখানে প্রদর্শিত হবে।" /></div></section><section className="section container"><SectionTitle eyebrow="সহজ তিন ধাপে" title="কীভাবে কাজ করে" /><div className="steps"><div><span>১</span><h3>খুঁজে নিন</h3><p>আপনার প্রয়োজন অনুযায়ী টিউটর বা টিউশন অনুসন্ধান করুন।</p></div><div><span>২</span><h3>আবেদন করুন</h3><p>পছন্দের সুযোগে আবেদন বা যোগাযোগের অনুরোধ পাঠান।</p></div><div><span>৩</span><h3>শুরু করুন</h3><p>অনুমোদিত যোগাযোগের মাধ্যমে শেখানো শুরু করুন।</p></div></div></section><section className="cta-section"><div className="container cta-inner"><div><span className="eyebrow">আপনি কি টিউটর?</span><h2>আপনার জ্ঞান দিয়ে<br />কারও ভবিষ্যৎ বদলে দিন</h2></div><Link className="button button-light" to="/register">টিউটর হিসেবে শুরু করুন →</Link></div></section><section className="section container"><SectionTitle eyebrow="নিরাপত্তা আগে" title="নিরাপদে সংযুক্ত হোন" text="আপনার নিরাপত্তা নিশ্চিত করতে আমরা স্বচ্ছ ও দায়িত্বশীল প্রক্রিয়া অনুসরণ করি।" /><div className="safety-grid"><div><b>🔒 তথ্যের গোপনীয়তা</b><p>আপনার ব্যক্তিগত তথ্য অনুমতি ছাড়া প্রকাশ করা হবে না।</p></div><div><b>✓ যাচাই প্রক্রিয়া</b><p>ভবিষ্যতের verification workflow-এ তথ্য যাচাই করা হবে।</p></div><div><b>⚑ রিপোর্ট করুন</b><p>যেকোনো উদ্বেগজনক আচরণ আমাদের জানাতে পারবেন।</p></div></div></section></>
}

function SearchPage({ tutors = false }: { tutors?: boolean }) {
  const [term, setTerm] = useState('')
  const [location, setLocation] = useState('')
  const [results, setResults] = useState<TutorRow[] | TuitionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const search = useCallback(async () => {
    setLoading(true)
    setError('')
    if (!supabase) {
      setLoading(false)
      setError('Supabase কনফিগার করা হয়নি।')
      return
    }
    if (tutors) {
      let query = supabase.from('tutor_profiles').select('id, headline, bio, subjects, classes, location, hourly_rate, is_verified, profiles!inner(full_name)').order('created_at', { ascending: false })
      const safeTerm = term.trim().replace(/[,()]/g, ' ')
      if (safeTerm) query = query.or(`headline.ilike.%${safeTerm}%,bio.ilike.%${safeTerm}%`)
      if (location) query = query.ilike('location', `%${location}%`)
      const { data, error: queryError } = await query
      if (queryError) setError(queryError.message)
      else setResults((data ?? []) as TutorRow[])
    } else {
      let query = supabase.from('tuition_posts').select('id, title, description, subject, class_level, location, schedule, budget, created_at').eq('status', 'published').order('created_at', { ascending: false })
      const safeTerm = term.trim().replace(/[,()]/g, ' ')
      if (safeTerm) query = query.or(`title.ilike.%${safeTerm}%,subject.ilike.%${safeTerm}%`)
      if (location) query = query.ilike('location', `%${location}%`)
      const { data, error: queryError } = await query
      if (queryError) setError(queryError.message)
      else setResults((data ?? []) as TuitionRow[])
    }
    setLoading(false)
  }, [location, term, tutors])

  useEffect(() => { void search() }, [search])

  return <div className="page container"><SectionTitle eyebrow={tutors ? 'টিউটর খোঁজা' : 'টিউশন খোঁজা'} title={tutors ? 'আপনার জন্য সঠিক টিউটর' : 'আপনার পরবর্তী টিউশন'} text="বিষয়, শ্রেণি ও অবস্থান দিয়ে সহজে অনুসন্ধান করুন।" /><form className="filter-bar" onSubmit={event => { event.preventDefault(); void search() }}><input value={term} onChange={event => setTerm(event.target.value)} placeholder={tutors ? 'নাম বা বিষয় দিয়ে খুঁজুন' : 'টিউশনের শিরোনাম বা বিষয়'} /><select value={location} onChange={event => setLocation(event.target.value)}><option value="">সব জেলা</option><option>ঢাকা</option><option>চট্টগ্রাম</option><option>সিলেট</option></select><button className="button button-primary" type="submit" disabled={loading}>খুঁজুন</button></form>{error && <div className="notice error-note" role="alert">{error}</div>}{loading ? <div className="loading-state">ফলাফল লোড হচ্ছে...</div> : results.length === 0 ? <EmptyState title={tutors ? 'এখনো কোনো টিউটর প্রোফাইল নেই' : 'এখনো কোনো টিউশন পোস্ট নেই'} text="অনুসন্ধানের মান পরিবর্তন করুন অথবা পরে আবার চেষ্টা করুন।" /> : <div className="result-grid">{tutors ? (results as TutorRow[]).map(tutor => { const name = tutor.profiles?.[0]?.full_name || 'অজ্ঞাত টিউটর'; return <article className="result-card" key={tutor.id}><div className="result-card-heading"><div className="profile-avatar small-avatar">{name.slice(0, 1)}</div><div><h3>{name}</h3><p>{tutor.headline}</p></div>{tutor.is_verified && <span className="verified-badge">যাচাইকৃত</span>}</div><p>{tutor.bio || 'এই টিউটর সম্পর্কে বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে।'}</p><div className="result-meta"><span>{tutor.location}</span><span>{tutor.subjects.join(' · ')}</span>{tutor.hourly_rate && <span>৳{tutor.hourly_rate}/ঘণ্টা</span>}</div></article> }) : (results as TuitionRow[]).map(post => <article className="result-card" key={post.id}><h3>{post.title}</h3><p>{post.description || 'এই টিউশন পোস্টের বিস্তারিত তথ্য দেখুন।'}</p><div className="result-meta"><span>{post.subject}</span><span>{post.class_level}</span><span>{post.location}</span>{post.budget && <span>৳{post.budget}</span>}</div></article>)}</div>}</div>
}

function SimplePage({ title, text }: { title: string; text: string }) { return <div className="page container narrow"><SectionTitle eyebrow="Tuition Connect Bangladesh" title={title} text={text} /><div className="notice">এই পেজের বিস্তারিত কনটেন্ট পরবর্তী ফেজে যুক্ত হবে। এখন কোনো অসম্পূর্ণ backend feature-কে কার্যকর বলে দেখানো হচ্ছে না।</div></div> }
function Login({ register = false }: { register?: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tutor')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    if (!supabase) {
      setError('Supabase credentials কনফিগার করা হয়নি। .env.local ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY যোগ করুন।')
      return
    }
    setLoading(true)
    const result = register
      ? await supabase.auth.signUp({ email, password, options: { data: { role } } })
      : await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (register && !result.data.session) {
      setMessage('নিবন্ধন সফল হয়েছে। ইমেইল যাচাই করে লগইন করুন।')
    } else {
      setMessage(register ? 'নিবন্ধন সফল হয়েছে।' : 'লগইন সফল হয়েছে।')
    }
  }

  return <div className="auth-page"><div className="auth-card"><Logo /><h1>{register ? 'আপনার অ্যাকাউন্ট তৈরি করুন' : 'স্বাগতম ফিরে আসায়'}</h1><p>{register ? 'Tuition Connect Bangladesh-এ যোগ দিন' : 'আপনার অ্যাকাউন্টে প্রবেশ করুন'}</p><form onSubmit={handleSubmit}><label>ইমেইল<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="আপনার ইমেইল" required /></label><label>পাসওয়ার্ড<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" minLength={6} required /></label>{register && <label>আপনি কী করতে চান?<select value={role} onChange={event => setRole(event.target.value)}><option value="tutor">টিউটর হিসেবে</option><option value="seeker">টিউশন খুঁজতে</option></select></label>}<button className="button button-primary full" type="submit" disabled={loading}>{loading ? 'অপেক্ষা করুন...' : register ? 'নিবন্ধন করুন' : 'লগইন করুন'}</button></form>{message && <div className="form-note success-note">{message}</div>}{error && <div className="form-note error-note" role="alert">{error}</div>}{!getAppConfig().hasSupabase && <div className="form-note">Authentication চালু করতে Supabase credentials কনফিগার করুন।</div>}<p className="switch-auth">{register ? 'আগেই অ্যাকাউন্ট আছে?' : 'অ্যাকাউন্ট নেই?'} <Link to={register ? '/login' : '/register'}>{register ? 'লগইন করুন' : 'নিবন্ধন করুন'}</Link></p></div></div>
}

function TutorProfileForm({ user }: { user: User | null }) {
  const [form, setForm] = useState({ fullName: '', headline: '', bio: '', subjects: '', classes: '', location: '', hourlyRate: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!user || !supabase) {
        setLoading(false)
        return
      }
      const [profileResult, tutorResult] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
        supabase.from('tutor_profiles').select('headline, bio, subjects, classes, location, hourly_rate').eq('user_id', user.id).maybeSingle(),
      ])
      if (profileResult.error || tutorResult.error) {
        setError(profileResult.error?.message || tutorResult.error?.message || 'প্রোফাইল লোড করা যায়নি।')
      } else {
        const tutor = tutorResult.data
        setForm({
          fullName: profileResult.data?.full_name || '',
          headline: tutor?.headline || '',
          bio: tutor?.bio || '',
          subjects: tutor?.subjects?.join(', ') || '',
          classes: tutor?.classes?.join(', ') || '',
          location: tutor?.location || '',
          hourlyRate: tutor?.hourly_rate?.toString() || '',
        })
      }
      setLoading(false)
    }
    void loadProfile()
  }, [user])

  function updateField(field: keyof typeof form, value: string) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    if (!user || !supabase) {
      setError('প্রোফাইল সেভ করতে আগে লগইন করুন।')
      return
    }
    setSaving(true)
    const profileResult = await supabase.from('profiles').update({ full_name: form.fullName }).eq('id', user.id)
    const tutorResult = await supabase.from('tutor_profiles').upsert({
      user_id: user.id,
      headline: form.headline,
      bio: form.bio || null,
      subjects: form.subjects.split(',').map(item => item.trim()).filter(Boolean),
      classes: form.classes.split(',').map(item => item.trim()).filter(Boolean),
      location: form.location,
      hourly_rate: form.hourlyRate ? Number(form.hourlyRate) : null,
    }, { onConflict: 'user_id' })
    setSaving(false)
    if (profileResult.error || tutorResult.error) {
      setError(profileResult.error?.message || tutorResult.error?.message || 'প্রোফাইল সেভ করা যায়নি।')
      return
    }
    setMessage('আপনার টিউটর প্রোফাইল সফলভাবে সেভ হয়েছে। এখন টিউটর খুঁজুন পেজে এটি দেখা যাবে।')
  }

  if (!user) return <div className="page container narrow"><SectionTitle eyebrow="টিউটর প্রোফাইল" title="লগইন করে প্রোফাইল তৈরি করুন" text="আপনার টিউটর প্রোফাইল তৈরি ও সম্পাদনা করতে আগে লগইন করুন।" /><Link className="button button-primary" to="/login">লগইন করুন</Link></div>
  if (loading) return <div className="page container"><div className="loading-state">প্রোফাইল লোড হচ্ছে...</div></div>

  return <div className="page container narrow"><SectionTitle eyebrow="টিউটর প্রোফাইল" title="আপনার প্রোফাইল তৈরি বা এডিট করুন" text="এই তথ্যগুলো টিউটর খুঁজুন পেজে প্রকাশ্যে দেখা যাবে।" /><form className="profile-form" onSubmit={saveProfile}><label>আপনার নাম<input value={form.fullName} onChange={event => updateField('fullName', event.target.value)} required /></label><label>প্রোফাইল শিরোনাম<input value={form.headline} onChange={event => updateField('headline', event.target.value)} placeholder="যেমন: অভিজ্ঞ গণিত ও পদার্থবিজ্ঞান টিউটর" required /></label><label>নিজের সম্পর্কে<textarea value={form.bio} onChange={event => updateField('bio', event.target.value)} placeholder="আপনার অভিজ্ঞতা ও পড়ানোর পদ্ধতি সম্পর্কে লিখুন" rows={5} /></label><div className="form-two-columns"><label>যেসব বিষয় পড়ান<input value={form.subjects} onChange={event => updateField('subjects', event.target.value)} placeholder="গণিত, ইংরেজি, পদার্থবিজ্ঞান" required /><small>কমা দিয়ে আলাদা করুন</small></label><label>যেসব শ্রেণি পড়ান<input value={form.classes} onChange={event => updateField('classes', event.target.value)} placeholder="নবম–দশম, একাদশ–দ্বাদশ" required /><small>কমা দিয়ে আলাদা করুন</small></label></div><div className="form-two-columns"><label>অবস্থান<input value={form.location} onChange={event => updateField('location', event.target.value)} placeholder="ঢাকা, বাংলাদেশ" required /></label><label>প্রতি ঘণ্টার পারিশ্রমিক<input type="number" min="0" value={form.hourlyRate} onChange={event => updateField('hourlyRate', event.target.value)} placeholder="৫০০" /></label></div><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'সেভ হচ্ছে...' : 'প্রোফাইল সেভ করুন'}</button>{message && <div className="form-note success-note">{message}</div>}{error && <div className="form-note error-note" role="alert">{error}</div>}</form></div>
}

function TutorDashboard() {
  return <div className="page container"><SectionTitle eyebrow="টিউটর ড্যাশবোর্ড" title="শুভ সকাল, রাকিব 👋" text="আপনার টিউশন কার্যক্রম এক নজরে দেখুন।" /><div className="demo-banner"><b>Dashboard preview</b><p>আবেদন ও পরিসংখ্যানের live workflow পরবর্তী ধাপে যুক্ত হবে।</p></div><div className="dashboard-grid"><section className="profile-card"><div className="profile-avatar">র</div><div><h2>আপনার টিউটর প্রোফাইল</h2><p>Supabase থেকে আপনার প্রোফাইল পরিচালনা করুন</p></div><Link className="text-link" to="/dashboard/tutor/profile">প্রোফাইল এডিট করুন →</Link></section><div className="stats-grid"><div className="stat-card"><small>প্রোফাইল ভিউ</small><strong>—</strong><em>শীঘ্রই live হবে</em></div><div className="stat-card"><small>আবেদন পাঠানো</small><strong>—</strong><em>শীঘ্রই live হবে</em></div></div></div><div className="dashboard-content"><section className="dashboard-panel"><div className="panel-heading"><div><h2>আপনার আবেদন</h2><p>আবেদন workflow সংযুক্ত হলে এখানে দেখা যাবে</p></div><Link className="text-link" to="/find-tuition">টিউশন দেখুন</Link></div><EmptyState title="এখনো কোনো আবেদন নেই" text="পছন্দের টিউশনে আবেদন করার সুবিধা শীঘ্রই যুক্ত হবে।" /></section></div></div>
}

function App() {
  const config = getAppConfig()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Session lookup failed:', error.message)
        return
      }
      setUser(data.session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])

  return <Layout user={user}><Routes><Route path="/" element={<Home />} /><Route path="/find-tutor" element={<SearchPage tutors />} /><Route path="/find-tuition" element={<SearchPage />} /><Route path="/tuition/:id" element={<SimplePage title="টিউশন বিস্তারিত" text="নির্দিষ্ট টিউশন পোস্টের বিস্তারিত তথ্য এখানে দেখা যাবে।" />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Login register />} /><Route path="/about" element={<SimplePage title="আমাদের সম্পর্কে" text="বাংলাদেশের শিক্ষার্থী, অভিভাবক ও টিউটরদের নিরাপদে সংযুক্ত করাই আমাদের লক্ষ্য।" />} /><Route path="/contact" element={<SimplePage title="যোগাযোগ করুন" text="সহায়তা ও যোগাযোগের সুবিধা শীঘ্রই চালু হবে।" />} /><Route path="/faq" element={<div className="page container narrow"><SectionTitle eyebrow="সহায়তা" title="সাধারণ প্রশ্ন" />{faqs.map(([question, answer]) => <details className="faq" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>} /><Route path="/privacy" element={<SimplePage title="গোপনীয়তা নীতি" text="আপনার ব্যক্তিগত তথ্য কীভাবে সুরক্ষিত রাখা হবে, তার নীতি এখানে প্রকাশ করা হবে।" />} /><Route path="/terms" element={<SimplePage title="শর্তাবলি" text="প্ল্যাটফর্ম ব্যবহারের নিয়ম ও দায়িত্বশীলতার নির্দেশিকা এখানে প্রকাশ করা হবে।" />} /><Route path="/how-it-works" element={<SimplePage title="কীভাবে কাজ করে" text="টিউটর খোঁজা, টিউশন পোস্ট করা এবং আবেদন করার প্রক্রিয়া ধাপে ধাপে জানুন।" />} /><Route path="/safety" element={<SimplePage title="নিরাপত্তা নির্দেশিকা" text="ব্যক্তিগত তথ্য সুরক্ষিত রাখুন এবং কোনো সন্দেহজনক আচরণ রিপোর্ট করুন।" />} /><Route path="/dashboard/tutor/profile" element={<TutorProfileForm user={user} />} /><Route path="/dashboard/tutor" element={<TutorDashboard />} /><Route path="/dashboard/*" element={<SimplePage title="ড্যাশবোর্ড" text="Protected dashboard routes Phase 3–7-এ যুক্ত হবে।" />} /><Route path="/admin/*" element={<SimplePage title="অ্যাডমিন" text="Admin authorization এবং dashboard পরবর্তী ফেজে যুক্ত হবে।" />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes><div className="config-banner">{config.hasSupabase ? 'Supabase সংযুক্ত আছে; authentication এবং marketplace data চালু।' : 'Foundation mode: Supabase credentials এখনো কনফিগার করা হয়নি।'}</div></Layout>
}

export default App
