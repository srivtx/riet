// Edit school facts here: every page reads from this file.
export const phone = '+91 73777 79000';
export const tel = 'tel:+917377779000';
export const email = 'hello@rietinternationalschool.com';
export const wa = (text = 'Hello RIET, I would like to know more about admission.') =>
  `https://wa.me/917377779000?text=${encodeURIComponent(text)}`;
export const hours = 'Monday to Saturday, 9:00 am to 5:00 pm';

export const nav = [
  ['About', '/about/'],
  ['Academics', '/academics/'],
  ['Campus life', '/campus-life/'],
  ['Gallery', '/gallery/'],
  ['Admissions', '/admissions/'],
  ['Contact', '/contact/'],
];

export const social = [
  ['YouTube', 'https://youtube.com/@rietinternationalschool'],
  ['Instagram', 'https://www.instagram.com/rietschool'],
  ['Facebook', 'https://www.facebook.com/share/1C6AATcJQM/'],
  ['LinkedIn', 'https://www.linkedin.com/company/riet-international-school'],
];

export const campuses = [
  { name: 'VSS Nagar', city: 'Bhubaneswar', lines: 'RIET House, 4755, VSS Nagar, Bhubaneswar, Odisha 751010', map: 'https://maps.app.goo.gl/me1RKzKjYSAEUbFv5', note: 'Main campus', lat: 20.31455, lng: 85.84624 },
  { name: 'Thakurpatna', city: 'Jajpur Road', lines: 'RIET House, Thakurpatna, Sankhachilla, Jajpur Road', map: 'https://maps.app.goo.gl/N9Rk5Jcb99VPcsqn6', note: 'CBSE affiliated, No. 1530488', lat: 20.91219, lng: 86.15114 },
  { name: 'Ganesh Bazar', city: 'Byasanagar', lines: 'Ganesh Bazar, near Government Hospital, Byasanagar, Jajpur Road', map: 'https://maps.app.goo.gl/krBs2XniQfJykqJx9', note: 'In the heart of town', lat: 20.9382, lng: 86.12943 },
];

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => `Class ${a + i}`);
export const stages = [
  { name: 'Early years', classes: ['Pre-Nursery', 'Nursery', 'LKG', 'UKG'] },
  { name: 'Primary', classes: range(1, 5) },
  { name: 'Middle', classes: range(6, 8) },
  { name: 'Senior', classes: range(9, 12) },
];
export const classes = stages.flatMap(s => s.classes);
export const family = 'Let us look at this school together: RIET International School, Bhubaneswar and Jajpur Road. https://rietinternationalschool.com';
export const videos = [
  { id: 'YRY0DbYCtjw', img: 'video-principal', title: 'A message from the Principal, Bhubaneswar', time: '1:24' },
  { id: 'H5uNLLPDShY', img: 'video-teachers', title: 'Teachers on life at RIET', time: '1:37' },
  { id: 'hvrFPh7NvqI', img: 'classical-dance', title: 'Students perform at the annual function', time: '4:27' },
];
const files = import.meta.glob<{ default: ImageMetadata }>('./assets/*.{jpg,png}', { eager: true });
export const img = (n: string) => (files[`./assets/${n}.jpg`] ?? files[`./assets/${n}.png`]).default;
