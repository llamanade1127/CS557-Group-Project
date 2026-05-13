'use client';

import Image from "next/image";
import Footer from './footer/footer'

import './body.css'


export default function Body() {
  return (
    <>
    <section id = "home" style={{ backgroundColor: 'white', color:'black' }}>
          <div className="container">
              <div className="row">
                  <div className="column left">
                      <Image src="/images/NewMac.png" alt="Description" width={800} height={650} />

                  </div>
                  <div className="column right">
                      <h1>
                          Your Ultimate Anime Journey Starts Here
                      </h1>
                      <p>
                          Users who are anime lovers or just getting started can browse through the list of anime series where they could find their favorite shows, manage their watchlist, rate the content, and receive personalized recommendations based on their view history.
                      </p>
                      <p><br></br>Join thousands of fans managing their viewing history and getting personalized recommendations based on what they actually love.</p>


                  </div>
              </div>
          </div>
      </section>

      <section id = "features" style={{ backgroundColor: 'white', color:'black' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem' }}>Features Designed for Fans</h1>
              <div className="container">
                  <div className="row">
                      <div className="column">
                        <h2 style={{ color: '#2e1d6e' }}>Your Personal Watchlist</h2>
                        <div style={{ marginBottom: '5px' }}>
                            <p style={{ marginBottom: '5px' }}>
                                Take full control of your viewing experience with your personalized watchlist:
                            </p>
                            
                            <ol>
                                <li><strong>Add:</strong> Save new discoveries.</li>
                                <li><strong>View:</strong> Access your entire watchlist.</li>
                                <li><strong>Delete:</strong> Keep your queue clean and relevant.</li>
                            </ol>

                            <p style={{ marginTop: '5px' }}>
                                Keep track of what you've finished and what's up next in your queue.
                            </p>
                            <p style={{ marginTop: '5px' }}>
                                Never lose your place again. Our intuitive interface ensures your list is always 
                                organized exactly how you like it.
                            </p>
                        </div>
                          <p><br></br>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.</p>
                      </div>

                      <div className="column">
                          <Image src="/images/list shows.png" alt="Description" width={800} height={650} />
                      </div>
                      
                      <div className="column">
                          <h2 style={{ color: '#2e1d6e' }}>Discover & Contribute</h2>
                            <div style={{ marginBottom: '5px' }}>
                                <p style={{ marginBottom: '5px' }}>
                                    Expand your library and influence the community with our discovery tools:
                                </p>
                                
                                <ol>
                                    <li><strong>Search:</strong> Find shows from our massive database.</li>
                                    <li><strong>Contribute:</strong> Add your own unique entries to the collection.</li>
                                    <li><strong>Rate:</strong> Review and score every series you watch.</li>
                                </ol>

                                <p style={{ marginTop: '5px' }}>
                                    Discovery has never been this seamless. Share your thoughts and help others find their next favorite show.
                                </p>
                                <p style={{ marginTop: '5px' }}>
                                    Get personalized recommendations tailored to your taste based on your unique rating history.
                                </p>

                                <p><br></br>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.</p>

                            </div>
                      </div>
                  </div>
              </div>
          </section>

      <section className = "sectiontwo">
              <div className="container">
                  <div className="row">
                      <div className="column left">
                            <h1>Ready to Elevate Your Anime Experience?</h1>
                            <p>
                                Anime Watchlist is more than just a tracker—it’s your personal gateway to the world of Japanese animation. 
                                Join a growing community of fans who take control of their viewing habits and never miss a beat.
                            </p>
                            <div style={{ marginTop: '20px'}}>
                                <p>
                                    Whether you want to deep-dive into seasonal hits or catalog the classics you’ve loved for years, 
                                    our platform provides the tools you need to stay organized. Rate your favorites, contribute 
                                    new titles, and see how your taste compares to fans worldwide.
                                </p>
                                <h3 style={{ fontWeight: 'bolder', color: '#c2b1ff' }}>
                                    Your next five-star series is waiting to be discovered.
                                </h3>
                            </div>
                       </div>
                      <div className="column right">
                          <Image src="/images/MACTwo.png" alt="Description" width={800} height={650} />

                      </div>
                      
                  </div>
              </div>
        </section>
        <Footer/>
    </>

    
  );
}