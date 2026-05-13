'use client';

import './footer.css';

export default function Footer() {
  return ( 
    <>
        <footer style={{ backgroundColor: 'white', color:'black' }}>
            <div className = "container">
                <h1>🎌Anime Watchlist</h1>
                    <div className = "row">
                        <div className = "column">
                            <p style={{ fontSize: 'large', fontWeight: 'bold' }} >Term & Condition  ------  Privacy Policy</p>
                        </div>
                        
                    </div>
                <p style={{ fontSize: 'medium'}}>© 2024 🎌Anime Watchlist. Anime data and images are provided by their
                respective owners. This site is for educational/personal use
                only.</p>
            </div>
        </footer>
    </>
  );
}