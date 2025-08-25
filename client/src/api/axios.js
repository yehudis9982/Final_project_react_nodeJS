import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:2025/api', // שנה לכתובת השרת שלך
  withCredentials: true,
});

export default instance;
