"use client"

import React, { useEffect, useState, useRef } from 'react'

interface AdBlockerDetectionProps {
    children: React.ReactNode
    onDetectedChange?: (detected: boolean) => void
}

const AdBlockerDetection: React.FC<AdBlockerDetectionProps> = ({ children, onDetectedChange }) => {
    const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false)
    const [showRestartMessage, setShowRestartMessage] = useState(false)
    const [spamCount, setSpamCount] = useState(0)
    const spamIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const undeadHostRef = useRef<HTMLElement | null>(null)
    const undeadShadowRef = useRef<ShadowRoot | null>(null)
    const undeadObserverRef = useRef<MutationObserver | null>(null)
    const undeadMutatorRef = useRef<NodeJS.Timeout | null>(null)
    const undeadWatchdogRef = useRef<NodeJS.Timeout | null>(null)
    const onDetectedChangeRef = useRef<AdBlockerDetectionProps['onDetectedChange']>()

    const UNDEAD_CONFIG = {
        changeIntervalMs: 3,         
        respawnCheckMs: 5,          
        zIndex: 2147483647,          
        classPrefix: "u_",          
        hostTag: "div",
        useClosedShadow: true,     
        text: {
            title: "Content Blocked",
            line1: "Your ad blocker is preventing this content from loading.",
            line2: "Please disable it to continue.",
            steps: ["Click ad blocker icon", "Disable for this site", "Refresh page"],
            btn: "Restart",
            verifying: "Checking if ad blocker is disabled..."
        }
    };

    const rand = (n=8) => UNDEAD_CONFIG.classPrefix + Math.random().toString(36).slice(2, 2+n);

    const detectAdBlocker = () => {
        try {
            const testAd = document.createElement('div')
            testAd.className = 'adsbox'
            testAd.style.cssText = 'position: absolute; left: -10000px; top: -1000px; width: 1px; height: 1px;'
            document.body.appendChild(testAd)
            
            const isBlocked = testAd.offsetHeight === 0 || testAd.offsetWidth === 0
            document.body.removeChild(testAd)
            
            if (isBlocked) return true

            const stealthTests = [
                () => {
                    const test = document.createElement('div')
                    test.className = 'advertisement'
                    test.style.cssText = 'position: absolute; left: -10000px; top: -1000px; width: 1px; height: 1px;'
                    document.body.appendChild(test)
                    const blocked = test.offsetHeight === 0
                    document.body.removeChild(test)
                    return blocked
                },
                () => {
                    const test = document.createElement('div')
                    test.className = 'adsbygoogle'
                    test.style.cssText = 'position: absolute; left: -10000px; top: -1000px; width: 1px; height: 1px;'
                    document.body.appendChild(test)
                    const blocked = test.offsetHeight === 0
                    document.body.removeChild(test)
                    return blocked
                },
                () => {
                    const test = document.createElement('div')
                    test.className = 'google-ad'
                    test.style.cssText = 'position: absolute; left: -10000px; top: -1000px; width: 1px; height: 1px;'
                    document.body.appendChild(test)
                    const blocked = test.offsetHeight === 0
                    document.body.removeChild(test)
                    return blocked
                }
            ]
            
            for (const test of stealthTests) {
                try {
                    if (test()) return true
                } catch {}
            }

            const testScript = document.createElement('script')
            testScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
            testScript.async = true
            
            return new Promise<boolean>((resolve) => {
                testScript.onerror = () => resolve(true)
                testScript.onload = () => resolve(false)
                
                setTimeout(() => {
                    resolve(true)
                }, 1000)
                
                document.head.appendChild(testScript)
            })
        } catch {
            return true
        }
    }

    useEffect(() => {
        const runDetection = async () => {
            const detected = await detectAdBlocker()
            setIsAdBlockerDetected(detected)
            
            if (detected) {
                mountUndead()
                watchUndead()
                startUndeadMutator()
                startUndeadWatchdog()
                plantUndeadBaits()
                startSpamming()
            } else {
                unmountUndead()
                if (undeadObserverRef.current) {
                    undeadObserverRef.current.disconnect()
                    undeadObserverRef.current = null
                }
                if (undeadMutatorRef.current) {
                    clearInterval(undeadMutatorRef.current)
                    undeadMutatorRef.current = null
                }
                if (undeadWatchdogRef.current) {
                    clearInterval(undeadWatchdogRef.current)
                    undeadWatchdogRef.current = null
                }
                stopSpamming()
            }
        }

        detectionIntervalRef.current = setInterval(runDetection, 500)
        runDetection()

        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current)
            }
            unmountUndead()
            if (undeadObserverRef.current) {
                undeadObserverRef.current.disconnect()
                undeadObserverRef.current = null
            }
            if (undeadMutatorRef.current) {
                clearInterval(undeadMutatorRef.current)
                undeadMutatorRef.current = null
            }
            if (undeadWatchdogRef.current) {
                clearInterval(undeadWatchdogRef.current)
                undeadWatchdogRef.current = null
            }
            stopSpamming()
        }
    }, [])

    useEffect(() => {
        onDetectedChangeRef.current = onDetectedChange
    }, [onDetectedChange])

    useEffect(() => {
        if (typeof onDetectedChangeRef.current === 'function') {
            onDetectedChangeRef.current(isAdBlockerDetected)
        }
    }, [isAdBlockerDetected])

    useEffect(() => {
        if (!isAdBlockerDetected) return;
        
        const rAF = () => {
            if (undeadHostRef.current && getComputedStyle(undeadHostRef.current).display === "none") {
                undeadHostRef.current.style.display = "block";
            }
            window.requestAnimationFrame(rAF);
        };
        window.requestAnimationFrame(rAF);
    }, [isAdBlockerDetected])

    function buildUndeadHTML() {
        return `
            <style>
                :host { all: initial; }
                .fixed { position: fixed; }
                .inset-0 { top:0; right:0; bottom:0; left:0; }
                .w-full { width: 100%; }
                .h-full { height: 100%; }
                .bg-black { background: rgba(0,0,0,1); }
                .absolute { position: absolute; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .p-4 { padding: 1rem; }
                .bg-purple-900 { background: #3b0764; }
                .border-2 { border-width: 2px; }
                .border-purple-600 { border-color: #9333ea; }
                .rounded-xl { border-radius: 0.75rem; }
                .shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.3); }
                .text-center { text-align: center; }
                .wmax { width: 100%; max-width: 24rem; }
                .p-6 { padding: 1.5rem; }
                .mb-2 { margin-bottom: .5rem; }
                .mb-3 { margin-bottom: .75rem; }
                .mb-4 { margin-bottom: 1rem; }
                .text-white { color: #fff; }
                .text-purple-200 { color: #e9d5ff; }
                .text-purple-300 { color: #d8b4fe; }
                .text-purple-800 { color: #5b21b6; }
                .bg-purple-700 { background: #7e22ce; }
                .rounded-lg { border-radius: .5rem; }
                .text-xs { font-size: .75rem; line-height: 1rem; }
                .text-sm { font-size: .875rem; line-height: 1.25rem; }
                .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
                .font-semibold { font-weight: 600; }
                .font-medium { font-weight: 500; }
                .btn { background:#fff; color:#4c1d95; padding:.5rem 1rem; border-radius:.5rem; cursor:pointer; border:0; }
                .btn:hover { filter: brightness(0.98); }
                .list { padding-left: .5rem; }
                .list li { margin: .125rem 0; }
                .no-scroll { position: fixed; width: 100%; overflow: hidden; }
            </style>
            <div class="fixed inset-0 w-full h-full" part="backdrop" aria-hidden="false" role="dialog" aria-modal="true">
            </div>
        `;
    }

    function createUndeadHost() {
        const el = document.createElement(UNDEAD_CONFIG.hostTag);
        el.style.all = "initial";
        el.style.position = "fixed";
        el.style.inset = "0";
        el.style.zIndex = String(UNDEAD_CONFIG.zIndex);
        el.setAttribute("aria-hidden", "false");
        
        const idToken = rand();
        const classToken = rand();
        el.id = idToken;
        el.className = classToken;

        try {
            if (UNDEAD_CONFIG.useClosedShadow && el.attachShadow) {
                const sr = el.attachShadow({ mode: "closed" });
                const container = document.createElement("div");
                container.innerHTML = buildUndeadHTML();
                sr.appendChild(container);
                
                el.addEventListener("click", (ev) => {
                    const t = ev.composedPath ? ev.composedPath()[0] : ev.target;
                    if (t && (t as HTMLElement).id === "_u_btn") {
                        const m = sr.querySelector ? sr.querySelector("#_u_msg") : null;
                        if (m && (m as HTMLElement).style) (m as HTMLElement).style.display = "block";
                        setTimeout(() => { try { location.reload(); } catch(_){} }, 1000);
                    }
                });
            } else {
                const shadowRoot = el.attachShadow ? el.attachShadow({ mode: "open" }) : null;
                if (shadowRoot) {
                    shadowRoot.innerHTML = buildUndeadHTML();
                    shadowRoot.getElementById("_u_btn")?.addEventListener("click", () => {
                        const m = shadowRoot.getElementById("_u_msg");
                        if (m && (m as HTMLElement).style) (m as HTMLElement).style.display = "block";
                        setTimeout(() => { try { location.reload(); } catch(_){} }, 1000);
                    });
                } else {
                    el.innerHTML = buildUndeadHTML();
                    el.querySelector("#_u_btn")?.addEventListener("click", () => {
                        const m = el.querySelector("#_u_msg");
                        if (m && (m as HTMLElement).style) (m as HTMLElement).style.display = "block";
                        setTimeout(() => { try { location.reload(); } catch(_){} }, 1000);
                    });
                }
            }
        } catch (_) {
            el.innerHTML = buildUndeadHTML();
        }

        return el;
    }

    function mountUndead() {
        if (undeadHostRef.current) return;
        const host = createUndeadHost();
        undeadHostRef.current = host;
        
        try { document.documentElement.style.overflow = "hidden"; } catch {}
        try { document.body.style.overflow = "hidden"; } catch {}
        document.documentElement.appendChild(host);
    }

    function unmountUndead() {
        if (!undeadHostRef.current) return;
        try { undeadHostRef.current.remove(); } catch {}
        undeadHostRef.current = null;
    }

    function watchUndead() {
        if (undeadObserverRef.current) return;
        undeadObserverRef.current = new MutationObserver(() => {
            if (!undeadHostRef.current || !undeadHostRef.current.isConnected) {
                mountUndead();
            }
        });
        undeadObserverRef.current.observe(document.documentElement, { childList: true, subtree: true });
    }

    function startUndeadMutator() {
        if (undeadMutatorRef.current) return;
        undeadMutatorRef.current = setInterval(() => {
            if (!undeadHostRef.current) return;
            undeadHostRef.current.id = rand();
            undeadHostRef.current.className = rand();
            if (Math.random() < 0.05) undeadHostRef.current.style.zIndex = String(UNDEAD_CONFIG.zIndex - Math.floor(Math.random()*10));
        }, UNDEAD_CONFIG.changeIntervalMs);
    }

    function startUndeadWatchdog() {
        if (undeadWatchdogRef.current) return;
        undeadWatchdogRef.current = setInterval(() => {
            if (!undeadHostRef.current || !undeadHostRef.current.isConnected) {
                mountUndead();
            }
        }, UNDEAD_CONFIG.respawnCheckMs);
    }

    function plantUndeadBaits() {
        const names = ["ads", "advertisement", "ad-banner", "sponsored", "adsbygoogle"];
        for (let i=0; i<names.length; i++) {
            const b = document.createElement("div");
            b.className = names[i] + " " + rand();
            b.style.cssText = "position:absolute;left:-99999px;top:-99999px;width:1px;height:1px;";
            document.body.appendChild(b);
        }
    }

    const startSpamming = () => {
        if (spamIntervalRef.current) return
        spamIntervalRef.current = setInterval(() => {
            setSpamCount(prev => prev + 1)
        }, 100) 
    }

    const stopSpamming = () => {
        if (spamIntervalRef.current) {
            clearInterval(spamIntervalRef.current)
            spamIntervalRef.current = null
        }
    }

    const handleRestartClick = () => {
        setShowRestartMessage(true)
        
        setTimeout(async () => {
            const stillDetected = await detectAdBlocker()
            
            if (stillDetected) {
                setShowRestartMessage(false)
                startSpamming()
            } else {
                setShowRestartMessage(false)
                setIsAdBlockerDetected(false)
                stopSpamming()
                
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            }
        }, 2000)
    }

    if (!isAdBlockerDetected) {
        return <>{children}</>
    }

    return (
        <>
            {children}
            
            <div className="fixed inset-0 w-full h-full z-[9998] bg-black">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="bg-purple-900 border-2 border-purple-600 rounded-xl p-4 sm:p-6 text-center w-full max-w-xs sm:max-w-sm shadow-lg">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2 sm:mb-3">
                            Content Blocked
                        </h2>
                        
                        <div className="text-purple-200 text-xs sm:text-sm mb-3 sm:mb-4 space-y-1 sm:space-y-2">
                            <p>Your ad blocker is preventing this content from loading.</p>
                            <p>Please disable it to continue.</p>
                        </div>
                        
                        <div className="bg-purple-700 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 text-left">
                            <h4 className="font-medium text-white mb-1 sm:mb-2 text-xs sm:text-sm">Quick Steps:</h4>
                            <ul className="text-purple-200 text-xs space-y-1">
                                <li>• Click ad blocker icon</li>
                                <li>• Disable for this site</li>
                                <li>• Refresh page</li>
                            </ul>
                        </div>
                        
                        {showRestartMessage && (
                            <div className="mt-2 sm:mt-3 text-purple-300 text-xs text-center">
                                Checking if ad blocker is disabled...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdBlockerDetection
