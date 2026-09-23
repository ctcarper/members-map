// This file contains the JavaScript code for the Members-Map project. 
// It handles the logic for fetching member data, initializing the map, 
// and placing markers based on the members' locations.

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// Fetch MW directory
fetch('https://membershipworks.com/api/directory/list?org=34035&format=json')
  .then(res => res.json())
  .then(data => {
    const members = data.members || [];
    const map = new mapboxgl.Map({
      container: 'mw-map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-84.5, 38.0],
      zoom: 6
    });

    const bounds = new mapboxgl.LngLatBounds();

    members.forEach(member => {
      if (!member.address) return;

      const address = member.address.replace(/\n/g, ', ');

      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`)
        .then(r => r.json())
        .then(geo => {
          if (!geo.features || !geo.features.length) return;

          const [lng, lat] = geo.features[0].center;

          new mapboxgl.Marker({ color: "#e63946" })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setHTML(
              `<strong>${member.name}</strong><br>${address}`
            ))
            .addTo(map);

          bounds.extend([lng, lat]);
          map.fitBounds(bounds, { padding: 40 });
        });
    });
  });