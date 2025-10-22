// "use client"; // This directive marks the component as a Client Component

// import { useState } from 'react';
// import styles from '../styles/Signup.module.css'; // Make sure to create this CSS module

// export default function Signup() {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [agreeTerms, setAgreeTerms] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => { // Added type for event
//     e.preventDefault();
//     // Handle signup logic here
//     console.log({ fullName, email, password, confirmPassword, agreeTerms });
//     if (password !== confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }
//     // You'd typically send this data to an API
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.card}>
//         <div className={styles.logoPlaceholder}>
//           Your Logo
//         </div>
//         <h1 className={styles.title}>Sign Up</h1>
        
//         <form onSubmit={handleSubmit}>
//           <div className={styles.formGroup}>
//             <label htmlFor="fullName" className={styles.label}>Full Name</label>
//             <input
//               type="text"
//               id="fullName"
//               className={styles.input}
//               placeholder="Enter your full name"
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//               required
//             />
//           </div>
//           <div className={styles.formGroup}>
//             <label htmlFor="email" className={styles.label}>Mobile / Email</label>
//             <input
//               type="email"
//               id="email"
//               className={styles.input}
//               placeholder="Enter mobile number or email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className={styles.formGroup}>
//             <label htmlFor="password" className={styles.label}>Password</label>
//             <input
//               type="password"
//               id="password"
//               className={styles.input}
//               placeholder="Enter password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className={styles.formGroup}>
//             <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
//             <input
//               type="password"
//               id="confirmPassword"
//               className={styles.input}
//               placeholder="Confirm password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//             />
//           </div>
//           <div className={styles.checkboxGroup}>
//             <input
//               type="checkbox"
//               id="agreeTerms"
//               className={styles.checkbox}
//               checked={agreeTerms}
//               onChange={(e) => setAgreeTerms(e.target.checked)}
//               required
//             />
//             <label htmlFor="agreeTerms" className={styles.checkboxLabel}>I agree to the Terms & Conditions</label>
//           </div>

//           <button type="submit" className={styles.signupButton}>Sign Up</button>
//         </form>

//         <div className={styles.orDivider}>
//           <span>Or sign up with</span>
//         </div>

//         <button className={styles.googleButton}>
//           {/* Ensure the path to your google-logo.png is correct relative to the public directory */}
//           <img src="sdfsd" alt="Google logo" className={styles.googleIcon} />
//           Continue with Google
//         </button>

//         <div className={styles.loginLink}>
//           Already have an account? <a href="/login" className={styles.link}>Login</a>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"; // This directive marks the component as a Client Component

import { useState } from 'react';
import styles from '../styles/Signup.module.css'; // Make sure to create this CSS module
import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
   const router = useRouter();


  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }
  if (!agreeTerms) {
    alert("You must agree to the Terms & Conditions.");
    return;
  }

  console.log({ fullName, email, password, agreeTerms });

  // After successful signup logic, redirect to login page
  router.push('/login');

};


    // In a real app, you'd make an API call here:
    // try {
    //   const response = await fetch('/api/signup', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ fullName, email, password }),
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     console.log('Signup successful:', data);
    //     // Redirect user or show success message
    //   } else {
    //     console.error('Signup failed:', data);
    //     // Show error message
    //   }
    // } catch (error) {
    //   console.error('Network error during signup:', error);
    // }
    

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoPlaceholder}>
        <img 
            src="/HCLogo.png" 
            alt="Health Care Logo" 
            height={120} 
            width={120} 
            style={{ borderRadius: "50%" }} 
        />        
        </div>

        <h1 className={styles.title}>Hi there, welcome to <span style={{ color: '#00BFFF' }}>Shedula</span></h1>
        <p className={styles.subtitle}>Create your account</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input
              type="text"
              id="fullName"
              className={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email" // Changed type to 'email' for better validation
              id="email"
              className={styles.input}
              placeholder="Enter mobile number or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className={styles.input}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="agreeTerms"
              className={styles.checkbox}
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="agreeTerms" className={styles.checkboxLabel}>I agree to the Terms & Conditions</label>
          </div>

          <button type="submit" className={styles.signupButton}>Sign Up</button>
        </form>


        <div className={styles.orDivider}>
          <span>or</span>
        </div>

        <button className={styles.googleButton}>
          {/* Ensure the path to your google-logo.png is correct relative to the public directory */}
         <img src="https://static.dezeen.com/uploads/2025/05/sq-google-g-logo-update_dezeen_2364_col_0.jpg" alt="Google logo" className={styles.googleIcon} />
           Continue with Google
         </button>

        <div className={styles.loginLink}>
          Don't have an account? <a href="/login" className={styles.link}>Login</a>
        </div>
      </div>
    </div>
  );
}