import api from "../api/axios";

const updateUserLocation = async () => {
  if (!navigator.geolocation) {
    console.log("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        await api.patch("/users/location", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        console.log("Location updated successfully.");
      } catch (error) {
        console.error("Failed to update location:", error);
      }
    },
    (error) => {
      console.error("Location permission denied:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    }
  );
};

export default updateUserLocation;