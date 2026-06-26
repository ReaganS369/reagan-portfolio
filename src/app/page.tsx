/** @format */

import HomeHero from '../components/hero/HomeHero';
import Contact from '../components/sections/Contact';
import Hero from '../components/sections/Hero';
import Projects from '../components/sections/Projects';
import { redirect } from 'next/navigation';

export default function Home() {
  return redirect('/admin');
}
