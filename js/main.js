document.addEventListener('DOMContentLoaded', () => {
  const fileSelect = document.querySelector('.file');
  const img = document.querySelector('.prew');
  const start = document.querySelector('.translate__btn');
  const progress = document.querySelector('.progress');
  const toText = document.querySelector('.translate__text--from');
  const clear = document.querySelector('.translate__x');
  let isBinarized = false;
  const selectOptions = document.querySelectorAll('.select__option');
  const selectTags = document.getElementsByClassName('translate__select');

  const setActiveOption = (selectElement, selectedValue) => {
    const options = selectElement.getElementsByClassName('select__option');
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option.dataset.value === selectedValue) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    }
  };

  for (let i = 0; i < selectTags.length; i++) {
    const selectTag = selectTags[i];

    selectTag.onclick = () => {
      selectTag.classList.toggle('active');
    };

    const options = selectTag.getElementsByClassName('select__option');
    for (let j = 0; j < options.length; j++) {
      const option = options[j];

      option.onclick = () => {
        const selectedValue = option.dataset.value;
        setActiveOption(selectTag, selectedValue);
      };
    }
  }

  const switcher = document.getElementById("switch");

  switcher.onclick = () => {
    const translateFrom = selectTags[0].querySelector('.select__option.active').dataset.value;
    const translateTo = selectTags[1].querySelector('.select__option.active').dataset.value;

    setActiveOption(selectTags[0], translateTo);
    setActiveOption(selectTags[1], translateFrom);

    var file = fileSelect.files[0];
    var imgUrl = window.URL.createObjectURL(new Blob([file], { type: 'image/jpg' }));
    img.src = imgUrl;
    isBinarized = false;

    start.click();
  };

  const binarizeImage = (image) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = (r + g + b) / 3;
      const threshold = 60;
      const binaryValue = luminance < threshold ? 0 : 255;

      data[i] = binaryValue;
      data[i + 1] = binaryValue;
      data[i + 2] = binaryValue;
    }

    context.putImageData(imageData, 0, 0);
    isBinarized = true;

    // Return the binarized image data
    return canvas.toDataURL('image/jpeg');
  };

  fileSelect.onchange = () => {
    var file = fileSelect.files[0];
    var imgUrl = window.URL.createObjectURL(new Blob([file], { type: 'image/jpg' }));
    img.src = imgUrl;
    isBinarized = false;
    start.click();
  };

  clear.onclick = () => {
    img.src = '';
    isBinarized = false;
  };

  start.onclick = async () => {
    toText.innerHTML = '';

    try {
      let imgData = img.src;

      if (!isBinarized) {
        const tempImg = new Image();
        tempImg.onload = () => {
          imgData = binarizeImage(tempImg);
          console.log('Image is binarized.');
        };
        tempImg.src = imgData;
      } else {
        console.log('Image is already binarized.');
      }

      const { data } = await Tesseract.recognize(imgData, 'eng+jpn+kor+ara');
      toText.textContent = data.text;

      let textToTranslate = data.text;
      let translateFrom = selectTags[0].querySelector('.select__option.active').dataset.value;
      let translateTo = selectTags[1].querySelector('.select__option.active').dataset.value;
      let translateUrl = `https://api.mymemory.translated.net/get?&q=${encodeURIComponent(textToTranslate)}&langpair=${translateFrom}|${translateTo}`;

      const response = await fetch(translateUrl);
      const translatedData = await response.json();
      toText.textContent = translatedData.responseData.translatedText;
      console.log(translatedData);

      progress.innerHTML = 'Done';
    } catch (error) {
      console.log('Error:', error);
    }
  };
});
