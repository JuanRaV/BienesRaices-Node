(function() {
    const lat = document.querySelector('#lat').value || 20.67444163271174;
    const lng = document.querySelector('#lng').value || -103.38739216304566;
    const mapa = L.map('mapa').setView([lat, lng ], 15);
    let marker;
    //Utilizar Providedr y Geocoder
    const geocodeService =  L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //El Pin 
    marker = new L.marker([lat,lng],{
        draggable:true,
        autoPan:true
    }).addTo(mapa)

    //Detectar el movimiento del pin y detectar su latitud y longitus
    marker.on('moveend',function(e){
        marker = e.target

        const posicion = marker.getLatLng()

        mapa.panTo(new L.LatLng(posicion.lat,posicion.lng)) //Centra a las coordenadas

        //Obtener informacion de la calle al soltar el pin
        geocodeService.reverse().latlng(posicion,15).run(function(error,resultado){
            // console.log(resultado)
            marker.bindPopup(resultado.address.LongLabel)

            //Llenar los campos
            document.querySelector('.calle').textContent= resultado?.address?.Address ?? '';
            document.querySelector('#calle').value= resultado?.address?.Address ?? '';
            document.querySelector('#lat').value= resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value= resultado?.latlng?.lng ?? '';

        })
    })
})()