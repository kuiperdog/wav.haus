async function submit() {
    var name = document.getElementById('subdomain').value.toLowerCase()
    if (!name || name == "www" || name.startsWith('-') || name.endsWith('-'))
        return;
    
    document.getElementById('claimBtn').value = "· · ·"
    document.getElementById('claimBtn').disabled = true

    const statusReq = await fetch('https://wav.haus/worker?name=' + name)
    const status = await statusReq.text()
    
    if (status == 'available') {
        document.getElementById('takenBox').style.display = "none"
        document.getElementById('passwordBox').style.display = "inherit"

        if (document.getElementById('password').value) {
            const res = await fetch('https://wav.haus/worker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: { "name": name, "password": document.getElementById('password').value }
            })
            if (await res.text() == 'success')
                location.href = '/edit?name=' + name
        }
    } else if (status =='taken') {
        document.getElementById('takenBox').style.display = "initial"
        document.getElementById('passwordBox').style.display = "none"
        document.getElementById('password').value = ""
        document.getElementById('editLink').href = "/edit?name=" + name
    }

    document.getElementById('claimBtn').value = "Claim"
    document.getElementById('claimBtn').disabled = false
}