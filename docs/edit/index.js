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

  switch (type) {
    case "carrd":
      data.settings.url = 'https://' + document.querySelector('[option="carrd"] input[type="text"]').value + '.carrd.co';
      data.settings.nofooter = document.querySelector('[option="carrd"] input[type="checkbox"]').checked;
      break;
    case "redirect":
      data.settings.url = document.querySelector('[option="redirect"] input[type="text"]').value;
      break;
    case "ghpages":
      data.settings.url = document.querySelector('[option="ghpages"] input[type="text"]').value + '.github.io';
      break;
    case "embed":
      data.settings.url = document.querySelector('[option="embed"] input[type="text"]').value;
      break;
    case "dns":
      data.settings.url = document.querySelector('[option="dns"] input[type="text"]').value;
      break;
  }

  const res = await fetch('https://wav.haus/worker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data
  });
  const status = await res.text();

  if (!res.ok || status == 'error')
    error.innerHTML = 'An error has occured. Please review all entered information, wait a moment, and try again.';
  if (status == 'fail')
    error.innerHTML = 'Incorrect password for ' + name + '.wav.haus';
  if (status == 'success')
    success.innerHTML = 'Changes saved successfully.'
  
  document.querySelector('input[type="submit"]').value = "Save";
  document.querySelector('input[type="submit"]').disabled = false;
});