const $ = document.getElementById.bind(document);
const setButton = $('select');
const saveButton = $('save');
const textarea = $('textarea');

setButton.addEventListener('click', async () => {
  electronAPI.fileSelect();
});

saveButton.addEventListener('click', () => {
    electronAPI.fileSave(textarea.value);
});