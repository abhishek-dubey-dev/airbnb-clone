const listingMap = document.getElementById("listing-map");
const mapStatus = document.getElementById("map-status");

if (listingMap && mapStatus && window.mapboxgl) {
	mapboxgl.accessToken = listingMap.dataset.mapboxToken;
	const locationQuery = listingMap.dataset.locationQuery;

	async function loadListingMap() {
		try {
			const geocodingUrl = new URL(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationQuery)}.json`
			);
			geocodingUrl.searchParams.set("limit", "1");
			geocodingUrl.searchParams.set("language", "en");
			geocodingUrl.searchParams.set("types", "address,place,locality,region,country");
			geocodingUrl.searchParams.set("access_token", mapboxgl.accessToken);

			const response = await fetch(geocodingUrl);
			if (!response.ok) {
				throw new Error(response.status === 401 ? "Invalid Mapbox token" : "Location lookup failed");
			}

			const data = await response.json();
			const feature = data.features && data.features[0];
			if (!feature || feature.geometry?.type !== "Point") {
				throw new Error("Location not found");
			}

			const [longitude, latitude] = feature.geometry.coordinates;
			const map = new mapboxgl.Map({
				container: listingMap,
				style: "mapbox://styles/mapbox/streets-v12",
				center: [longitude, latitude],
				zoom: 11,
				cooperativeGestures: true,
			});

			map.addControl(new mapboxgl.NavigationControl(), "top-right");
			new mapboxgl.Marker({ color: "#fe424d" })
				.setLngLat([longitude, latitude])
				.setPopup(new mapboxgl.Popup({ offset: 28 }).setText(locationQuery))
				.addTo(map);
			map.on("load", () => map.resize());
			mapStatus.textContent = `Showing ${feature.place_name || locationQuery}`;
		} catch (error) {
			const message = error.message === "Invalid Mapbox token"
				? "Mapbox token invalid or expired. Update MAPBOX_TOKEN in .env."
				: "We could not find this location. Please check the listing address.";
			listingMap.innerHTML = `<div class="map-error"><i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i><span>${message}</span></div>`;
			mapStatus.textContent = "";
		}
	}

	loadListingMap();
}
