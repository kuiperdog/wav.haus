const name = new URLSearchParams(window.location.search).get('name');
document.getElementById('header').innerHTML = '✏️ ' + name + '.wav.haus';
if (!name)
  window.location.href = "https://wav.haus"

document.querySelector('form').reset();
var type = "";

Array.from(document.getElementsByClassName('option')).forEach(element => {
  var radio = element.querySelector('input[name="option"]');
  element.onclick = () => { radio.checked = true; radioSwitched(element); }
  radio.addEventListener('change', () => { if (radio.checked) radioSwitched(element) });
});

function radioSwitched(option) {
  const oldSelection = document.querySelector('.content[style*="display: initial"]');
  if (oldSelection)
    oldSelection.style.display = "none";
  option.querySelector('.content').style.display = 'initial';
  type = option.getAttribute('option');
}

document.querySelector('form').addEventListener('submit', async e => {
  e.preventDefault();

  const password = document.querySelector('input[type="password"]').value;
  const error = document.getElementById('error');
  const success = document.getElementById('success');
  error.innerHTML = '';
  success.innerHTML = '';

  if (!password) {
    error.innerHTML = 'Enter your password to save changes.';
    return;
  }

  if (!type) {
    error.innerHTML = 'Select 1 option.';
    return;
  }

  var data = {
    name: name,
    password: password,
    settings: {
      type: type
    }
  };

  document.querySelector('input[type="submit"]').value = "· · ·";
  document.querySelector('input[type="submit"]').disabled = true;

  var incomplete = false;

  switch (type) {
    case "carrd":
      var carrdurl = document.querySelector('[option="carrd"] input[type="text"]').value;
      incomplete = !carrdurl;
      data.settings.url = carrdurl.split('.')[0].trim() + '.carrd.co';
      if (!data.settings.url.startsWith('https://'))
        data.settings.url = 'https://' + data.settings.url;
      data.settings.nofooter = document.querySelector('[option="carrd"] input[type="checkbox"]').checked;
      break;
    case "redirect":
      data.settings.url = document.querySelector('[option="redirect"] input[type="text"]').value.trim();
      incomplete = !data.settings.url;
      if (!data.settings.url.startsWith('https://'))
        data.settings.url = 'https://' + data.settings.url;
      break;
    case "ghpages":
      var ghusername = document.querySelector('[option="ghpages"] input[type="text"]').value.trim();
      incomplete = !ghusername;
      data.settings.url = ghusername + '.github.io';
      break;
    case "embed":
      data.settings.url = document.querySelector('[option="embed"] input[type="text"]').value;
      break;
    case "dns":
      data.settings.url = document.querySelector('[option="dns"] input[type="text"]').value;
      break;
  }

  if (incomplete || !data.settings.url) {
    error.innerHTML = 'Required fields have not been filled out.';
    document.querySelector('input[type="submit"]').value = "Save";
    document.querySelector('input[type="submit"]').disabled = false;
    return;
  }

  const res = await fetch('https://wav.haus/worker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const status = await res.text();

  if (!res.ok || status == 'error')
    error.innerHTML = 'An error has occured. Please review all entered information, wait a moment, and try again.';
  if (status == 'fail')
    error.innerHTML = 'Incorrect password for ' + name + '.wav.haus';
  if (status == 'success')
    success.innerHTML = 'Changes saved successfully. <br><a href="https://' + name + '.wav.haus">(View your site)</a>'
  
  document.querySelector('input[type="submit"]').value = "Save";
  document.querySelector('input[type="submit"]').disabled = false;
  document.querySelector('form').reset();
});
