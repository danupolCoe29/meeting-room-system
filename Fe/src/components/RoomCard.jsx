import { Users, Video, MapPin } from "lucide-react";

const RoomCard = ({ room = {} }) => (
  <div className="border rounded-xl shadow-sm hover:shadow-md transition p-4 bg-white">
    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
      <span className="text-gray-400">Room Image</span>
    </div>
    <h3 className="text-lg font-bold text-gray-800">{room?.name}</h3>
    <div className="flex gap-4 my-2 text-sm text-gray-600">
      <span className="flex items-center gap-1">
        <Users size={16} /> {room?.capacity} seats
      </span>
      <span className="flex items-center gap-1">
        <MapPin size={16} /> Floor {room?.floor}
      </span>
    </div>
    <div className="flex gap-2 mb-4">
      {room?.hasProjector && <Video size={18} className="text-blue-500" />}
    </div>
    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
      Book This Room
    </button>
  </div>
);
export default RoomCard;
