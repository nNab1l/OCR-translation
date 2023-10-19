document.addEventListener('DOMContentLoaded', () => {
    const fileSelect = document.querySelector('.file');
    const img = document.querySelector('.prew');
    const start = document.querySelector('.translate__btn');
    const progress = document.querySelector('.progress');
    const toText = document.querySelector('.translate__text--from');
    const clear = document.querySelector('.translate__x');
    const selectTag = document.getElementsByClassName('translate__select');
  
    let isBinarized = false;
  
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
        const threshold = 128;
        const binaryValue = luminance < threshold ? 0 : 255;
  
        data[i] = binaryValue;
        data[i + 1] = binaryValue;
        data[i + 2] = binaryValue;
      }
  
      context.putImageData(imageData, 0, 0);
      isBinarized = true;
  
      // Update the img element with the binarized image
      img.src = canvas.toDataURL('image/jpeg');
    };
  
    fileSelect.onchange = () => {
      var file = fileSelect.files[0];
      var imgUrl = window.URL.createObjectURL(new Blob([file], { type: 'image/jpg' }));
      img.src = imgUrl;
      isBinarized = false;
    };
  
    clear.onclick = () => {
      img.src = '';
      isBinarized = false;
    };
  
    start.onclick = async () => {
      toText.innerHTML = '';
  
      try {
        let imgSrc = img.src;
        
        if (!isBinarized) {
          const tempImg = new Image();
          tempImg.onload = () => {
            binarizeImage(tempImg);
            console.log('Image is binarized.');
          };
          tempImg.src = imgSrc;
        } else {
          console.log('Image is already binarized.');
        }
  
        const { data } = await Tesseract.recognize(imgSrc, 'jpn');
        toText.textContent = data.text;
  
        let textToTranslate = data.text;
        let translateFrom = selectTag[0].value;
        let translateTo = selectTag[1].value;
        let translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${translateFrom}|${translateTo}`;
  
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
  