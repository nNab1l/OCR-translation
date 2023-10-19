document.addEventListener('DOMContentLoaded', () => {
    const fileSelect = document.querySelector('.file');
    const img = document.querySelector('.prew');
    const start = document.querySelector('.translate__btn');
    const progress = document.querySelector('.progress');
    const toText = document.querySelector('.translate__text--from');
    const clear = document.querySelector('.translate__x');
    const selectTag = document.getElementsByClassName('translate__select');
  
    fileSelect.onchange = () => {
      var file = fileSelect.files[0];
      var imgUrl = window.URL.createObjectURL(new Blob([file], { type: 'image/jpg' }));
      img.src = imgUrl;
    };
  
    clear.onclick = () => {
      img.src = '';
    };
  
    start.onclick = async () => {
      toText.innerHTML = '';
      const { data } = await Tesseract.recognize(fileSelect.files[0], 'kor');
  
      let isRecognizing = true;
  
      data.progress(({ status, progress }) => {
        if (status === 'recognizing text') {
          progress.innerHTML = `${status} ${progress}`;
        } else {
          progress.innerHTML = status;
        }
  
        if (status === 'done' && isRecognizing) {
          isRecognizing = false;
          toText.textContent = data.text;
          let textToTranslate = data.text;
          let translateFrom = selectTag[0].value;
          let translateTo = selectTag[1].value;
          let translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${translateFrom}|${translateTo}`;
  
          fetch(translateUrl)
            .then((res) => res.json())
            .then((data) => {
              toText.textContent = data.responseData.translatedText;
              console.log(data);
            })
            .catch((error) => {
              console.log('Translation error:', error);
            });
  
          progress.innerHTML = 'Done';
        }
      });
  
      data.start();
    };
  });
  