// 🎡 Image Carousel Logic
const images = [
  "https://images.pexels.com/photos/30694611/pexels-photo-30694611/free-photo-of-scenic-palm-tree-avenue-on-a-sunny-day.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/31184761/pexels-photo-31184761/free-photo-of-border-collie-on-snowy-tree-stump-in-winter.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/31130818/pexels-photo-31130818/free-photo-of-moss-covered-rocks-amidst-sunlit-pebbles.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/13592481/pexels-photo-13592481.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
];
let currentIndex = 0;

function updateImage() {
  document.getElementById("carousel-img").src = images[currentIndex];
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % images.length;
  updateImage();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateImage();
}

// 😂 Joke Fetch API Logic
async function fetchJoke() {
  const res = await fetch('https://official-joke-api.appspot.com/random_joke');
  const data = await res.json();
  document.getElementById('joke-text').innerText = `${data.setup} - ${data.punchline}`;
}
