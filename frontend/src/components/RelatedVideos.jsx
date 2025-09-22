import { useEffect, useState } from "react";
import axios from "axios";
import VideoList from "./VideoList";
import styles from "./RelatedVideos.module.css"


function RelatedVideos({ videoId }) {
  const BASE_URL = process.env.REACT_APP_BACKEND_URL;
  const [relatedVideos, setRelatedVideos] = useState([]);

  useEffect(() => {
    async function fetchRelated() {
      const res = await axios.get(
        `${BASE_URL}/video/${videoId}/related`
      );
      setRelatedVideos(res.data);
    }
    fetchRelated();
  }, [BASE_URL, videoId]);



  return (
    <div>
      <div flex flex-col gap-3>

        <VideoList videos={relatedVideos} className= {styles.reletedPage}/> 
        {/*relatedVideos.map((vid) => (
        <Link key={vid._id} to={`/video/${vid._id}` }>
            <VideoCard video={vid}  />
          </Link>
          
        ))*/}
      </div>
    </div>
  );
}

export default RelatedVideos;
