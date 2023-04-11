import axios, { isCancel, AxiosError } from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import debounce from 'lodash.debounce';


const searchFormDOM = document.querySelector('.search-form');
const inputSearchDOM = document.querySelector("[name='searchQuery']");
const galleryDOM = document.querySelector('.gallery');
const btnMoreDOM = document.querySelector('.load-more');

const PIXABAY_URL = 'https://pixabay.com/api/';
const PIXABAY_KEY = '35277928-d8ad441d4de6d13b09832f3da';
const IMG_PER_PAGE = 40;

let wordKey;
let page;
let lightbox = new SimpleLightbox('.gallery a');

const searchImages = e => {
  e.preventDefault();
  wordKey = inputSearchDOM.value.trim().split(' ').join('+');
  if (wordKey === null || wordKey === '') {
    Notiflix.Notify.info('Please type something in the search input.');
    return;
  }
  page = 1;
  fetchImages(wordKey, page);
  viewImages();
};

const fetchImages = async () => {
  let params = new URLSearchParams({
    key: PIXABAY_KEY,
    q: wordKey,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: IMG_PER_PAGE,
  });

  const response = await axios.get(`${PIXABAY_URL}?${params}&page=${page}`);
  const images = response.data;
  return images;
};

const viewImages = async () => {
  let imageListHtml = '';
  try {
    const images = await fetchImages();

    if (images.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);

    imageListHtml = images.hits
      .map(image => {
        return `
        <div class="photo-card">
          <a href="${image.largeImageURL}">
            <img class="img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b>
              ${image.likes}
            </p>
            <p class="info-item">
              <b>Views</b>
              ${image.views}
            </p>
            <p class="info-item">
              <b>Comments</b>
              ${image.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>
              ${image.downloads}
            </p>
          </div>
        </div>
      `;
      })
      .join('');
    galleryDOM.innerHTML = imageListHtml;

    lightbox.refresh();
  } catch (error) {
    console.log(error.message);
  }
};

const viewNextImages = async () => {
  let imageListHtml = '';
  try {
    const nextImages = await fetchImages();

    if (nextImages.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    imageListHtml = nextImages.hits
      .map(image => {
        return `
        <div class="photo-card">
          <a href="${image.largeImageURL}">
            <img class="img" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b>
              ${image.likes}
            </p>
            <p class="info-item">
              <b>Views</b>
              ${image.views}
            </p>
            <p class="info-item">
              <b>Comments</b>
              ${image.comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>
              ${image.downloads}
            </p>
          </div>
        </div>
      `;
      })
      .join('');
    galleryDOM.insertAdjacentHTML('beforeend', imageListHtml);

    lightbox.refresh();
  } catch (error) {
    console.log(error.message);
  }
};
const loadMoreImages = async () => {
  try {
    const images = await fetchImages();

    const totalImages = images.totalHits;

    const totalPages = Math.ceil(totalImages / IMG_PER_PAGE);

    if (page === totalPages) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
    page++;

    const nextImage = await fetchImages();

    viewNextImages(nextImage);
  } catch (error) {
    console.log(error.message);
  }
};
const btnMoreOn = () => (btnMoreDOM.style.display = 'block');
const btnMoreOf = () => (btnMoreDOM.style.display = 'none');


btnMoreDOM.addEventListener('click', loadMoreImages);
searchFormDOM.addEventListener('submit', searchImages);

window.addEventListener(
  'scroll',
  debounce(() => {
    const imagesHiddenHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scroll = window.scrollY;

    if (scroll > imagesHiddenHeight - 500) {
      loadMoreImages();
    }
  }, 300)
);
