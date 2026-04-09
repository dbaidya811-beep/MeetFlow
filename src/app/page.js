'use client';

import { useState } from 'react';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [createdMeetingId, setCreatedMeetingId] = useState('');
  const [userName, setUserName] = useState('');
  const [hostName, setHostName] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const createMeeting = () => {
    const meetingId = Math.random().toString(36).substring(2, 10);
    setCreatedMeetingId(meetingId);
    setHostName(userName.trim() || 'Anonymous');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCreatedMeetingId('');
  };

  const copyLink = () => {
    const link = `${window.location.origin}/meeting/${createdMeetingId}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-white">MeetFlow</div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-zinc-300 hover:text-white transition">Features</a>
          <a href="#how-it-works" className="text-zinc-300 hover:text-white transition">How It Works</a>
        </div>
        <button onClick={createMeeting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition">
          Get Started
        </button>
      </nav>

      <section className="px-8 py-24 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Video Meetings,<br />
          <span className="text-indigo-400">Made Simple</span>
        </h1>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Connect with your team anywhere, anytime. Crystal-clear video calls, screen sharing, and collaboration tools in one seamless platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-4 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-lg"
            onKeyDown={(e) => e.key === 'Enter' && userName.trim() && createMeeting()}
          />
        </div>
        <button onClick={createMeeting} disabled={!userName.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-semibold text-lg transition">
          Start Meeting
        </button>
      </section>

      <section className="px-8 py-24 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          See It In Action
        </h2>
        <p className="text-xl text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
          Experience seamless video conferencing with our intuitive interface
        </p>
        <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-3 max-w-5xl mx-auto shadow-2xl">
          <div className="bg-zinc-900 rounded-xl overflow-hidden">
            <div className="p-3 bg-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-zinc-400 text-sm">MeetFlow - Team Meeting</div>
              <div className="w-20"></div>
            </div>
            <div className="aspect-video bg-zinc-950 relative">
              <div className="absolute inset-2 grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))_from-indigo-500_via-purple-500_to-pink-500]"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-2xl font-bold text-white">You</span>
                  </div>
                  <span className="mt-3 text-zinc-300 font-medium">You</span>
                </div>
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))_from-blue-500_via-cyan-500_to-teal-500]"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-2xl font-bold text-white">Alex</span>
                  </div>
                  <span className="mt-3 text-zinc-300 font-medium">Alex</span>
                </div>
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))_from-green-500_via-emerald-500_to-teal-500]"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <span className="text-2xl font-bold text-white">Sarah</span>
                  </div>
                  <span className="mt-3 text-zinc-300 font-medium">Sarah</span>
                </div>
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))_from-orange-500_via-red-500_to-pink-500]"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-2xl font-bold text-white">Mike</span>
                  </div>
                  <span className="mt-3 text-zinc-300 font-medium">Mike</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent flex items-end justify-center pb-4">
                <div className="flex items-center gap-4 bg-zinc-800/90 backdrop-blur-sm px-6 py-3 rounded-full">
                  <button className="w-12 h-12 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button className="w-12 h-12 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button className="w-12 h-12 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1m-6.25 1h6.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25h-6.5a2.25 2.25 0 00-2.25 2.25v8.5a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </button>
                  <button className="w-12 h-12 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-zinc-800/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">00:42:18</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-8 py-24 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          Everything You Need
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-800/50 p-8 rounded-2xl border border-zinc-700">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">HD Video</h3>
            <p className="text-zinc-400">Crystal-clear video quality up to 4K resolution for professional meetings.</p>
          </div>
          <div className="bg-zinc-800/50 p-8 rounded-2xl border border-zinc-700">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1m-6.25 1h6.5a2.25 2.25 0 002.25-2.25V5.75a2.25 2.25 0 00-2.25-2.25h-6.5a2.25 2.25 0 00-2.25 2.25v8.5a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">End-to-End Encryption</h3>
            <p className="text-zinc-400">Your conversations stay private with bank-level security.</p>
          </div>
          <div className="bg-zinc-800/50 p-8 rounded-2xl border border-zinc-700">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Unlimited Participants</h3>
            <p className="text-zinc-400">Host meetings with as many people as you need, no limits.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-8 py-24 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">1</div>
            <h3 className="text-xl font-semibold text-white mb-2">Create a Meeting</h3>
            <p className="text-zinc-400">Click start and get a unique link to share</p>
          </div>
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">2</div>
            <h3 className="text-xl font-semibold text-white mb-2">Invite Others</h3>
            <p className="text-zinc-400">Share the link with your team or clients</p>
          </div>
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">3</div>
            <h3 className="text-xl font-semibold text-white mb-2">Start Talking</h3>
            <p className="text-zinc-400">Join and collaborate in HD video quality</p>
          </div>
        </div>
      </section>

      <section className="px-8 py-24 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-zinc-400 mb-10">
          Join thousands of teams already using MeetFlow.
        </p>
        <button onClick={createMeeting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition">
          Start Free Today
        </button>
      </section>

      <footer className="px-8 py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold text-white">MeetFlow</div>
          <p className="text-zinc-500">© 2026 MeetFlow. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-zinc-400 hover:text-white transition">Privacy</a>
            <a href="/terms" className="text-zinc-400 hover:text-white transition">Terms</a>
          </div>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-zinc-800 p-8 rounded-2xl w-full max-w-md border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Meeting Created</h2>
              <button onClick={closeModal} className="text-zinc-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div>
                <p className="text-zinc-400 mb-4">Your meeting has been created. Share the link below:</p>
                <input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/meeting/${createdMeetingId}`}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white mb-4"
                />
                <div className="flex gap-4">
                  <button onClick={copyLink} className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${linkCopied ? 'bg-emerald-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}>
                    {linkCopied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>
                  <button onClick={() => window.location.href = `/meeting/${createdMeetingId}?name=${encodeURIComponent(hostName)}`} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join Meeting
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}