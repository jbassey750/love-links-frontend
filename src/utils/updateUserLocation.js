import api from "../api/axios";

const updateUserLocation = async () => {
  if (!navigator.geolocation) {
    console.warn("[Frontend] Geolocation not supported by this browser.");
    return;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.patch("/users/location", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          console.log("[Frontend] Location updated successfully.");
        } catch (error) {
          console.warn("[Frontend] Location update failed; login remains valid.", error);
        } finally {
          resolve();
        }
      },
      (error) => {
        console.warn("[Frontend] Location permission denied or unavailable; continuing login.", error.message);
        resolve();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  });
};

export default updateUserLocation;