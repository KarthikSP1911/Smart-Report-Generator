import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FASTAPI_BASE_URL } from '../config/api.config';

import heroImg from '../assets/hero_academic_v4.png';

const Home = () => {
    const [data, setData] = useState("");

    useEffect(() => {
        axios.get(`${FASTAPI_BASE_URL}/`)
            .then(res => setData(res.data.message))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="container fade-in">
            <header className="hero" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4rem', flexDirection: 'row' }}>
                <div style={{ flex: '1', textAlign: 'left' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1.25rem', fontWeight: '800', lineHeight: '1.2', color: 'var(--text-primary)' }}>
                        Academic Performance Dashboard
                    </h1>
                    <p style={{ fontSize: '1.15rem', maxWidth: '500px', margin: '0 0 3rem 0', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                        A centralized platform for students and proctors to monitor academic progress, track attendance, analyze performance trends, and generate comprehensive reports.
                    </p>
                    <div className="cta-buttons" style={{ display: 'flex', gap: '1.25rem', justifyContent: 'flex-start' }}>
                        <Link to="/student-login" className="btn btn-primary" style={{ minWidth: '160px' }}>
                            Student Portal
                        </Link>
                        <Link to="/proctor-login" className="btn btn-secondary" style={{ minWidth: '160px' }}>
                            Proctor Portal
                        </Link>
                    </div>
                </div>
                <div style={{ flex: '1.2', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
                    <img
                        src={heroImg}
                        alt="AI Academic Reporting Dashboard Illustration"
                        style={{
                            maxWidth: '120%', /* Slight overflow for better coverage */
                            height: 'auto',
                            maxHeight: '600px',
                            opacity: 0.95, /* Subtly softened for blending */
                            mixBlendMode: 'multiply', /* Key for white-background illustrations on gray bg */
                            filter: 'saturate(1.1) drop-shadow(0 20px 40px rgba(59, 130, 246, 0.05))',
                            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 92%)',
                            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 92%)',
                            objectFit: 'contain',
                            transform: 'translateX(10%) perspective(1000px) rotateY(-5deg)', /* Depth effect */
                            transition: 'all 0.5s ease'
                        }}
                    />
                </div>
            </header>


        </div>
    );
};

export default Home;
