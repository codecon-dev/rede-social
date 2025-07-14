import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import Navbar from '../components/Navbar';

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <Navbar />
      <section className='landing-page'>

        {isLogin ? <LoginForm isLogin={isLogin} setIsLogin={setIsLogin} /> : <RegisterForm isLogin={isLogin} setIsLogin={setIsLogin} />}
      </section>
    </>
  );
};

export default LandingPage;