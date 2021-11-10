import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';

const API = 'http://demo.subsonic.org/rest/';
const USER = 'guest';
const PASS = 'guest';

const DOUBLE_LEFT_ARROW = `&lArr;`;
const DOUBLE_RIGHT_ARROW = `&rArr;`;

const makeUrl = (getEntityParams = () => '') => {
    return encodeURI(`${API}${getEntityParams()}&u=${USER}&p=${PASS}&v=1.16.1&c=testapp&f=json`);
}

const fillImages = (albums) => {
    return albums.map(album => {
        return {
            ...album, imageSrc: makeUrl(() => {
                return `getCoverArt?id=${album.coverArt}`
            })
        };
    });
}

const isOk = (jsonResponse) => {
    return jsonResponse?.['subsonic-response']?.status === 'ok'
}

const getAlbumsList = (jsonResponse) => {
    if (!isOk(jsonResponse)) {
        return [];
    }

    return fillImages(jsonResponse?.['subsonic-response']['albumList']['album'])
}

const readTracks = (jsonResponse) => {
    if (!isOk(jsonResponse)) {
        return [];
    }

    return jsonResponse?.['subsonic-response']['album']['song'];
}

const useFetchAlbums = (makeUrl, readAlbums) => {
    const [albums, setAlbums] = React.useState([]);
    const [fetched, setFetched] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (!fetched) {
            setLoading(true);
            fetch(makeUrl(() => {
                return 'getAlbumList?type=random'
            }))
                .then((data) => data.json())
                .then(data => {
                    const albums = readAlbums(data);
                    setAlbums(albums);
                }).finally(() => {
                setFetched(true);
                setLoading(false);
            });
        }

    }, [])

    return {
        loading,
        albums,
        fetched
    }
}

const useTracks = (makeUrl, albumId, readTracks) => {
    const [tracks, setTracks] = useState([]);

    React.useEffect(() => {
        if (!albumId) {
            return;
        }

        fetch(makeUrl(() => {
            return `getAlbum?id=${albumId}`
        })).then((response) => {
            return response.json();
        })
            .then(tracks => {
                setTracks(readTracks(tracks));
            })
    }, [albumId]);

    return {
        tracks
    }

}

function App() {
    const {loading, albums, fetched} = useFetchAlbums(makeUrl, getAlbumsList);
    const [selectedTrackId, setselectedTrackId] = useState(null);
    const {tracks} = useTracks(makeUrl, selectedTrackId, readTracks);
    return (
        <div className="App">
            <div >
                albums
                <div className={'scroll-container'}>
                    {fetched && <button dangerouslySetInnerHTML={{__html: DOUBLE_LEFT_ARROW}}></button>}
                    <div className="container">
                        {albums.map(({id, title, imageSrc}) => {
                            return <div className={'album'} key={id} onClick={() => setselectedTrackId(id)}>
                                <img className={'image'} src={imageSrc} alt={title}/>
                            </div>
                        })}
                    </div>
                    {fetched && <button dangerouslySetInnerHTML={{__html: DOUBLE_RIGHT_ARROW}}></button>}
                </div>

                <div>
                    {tracks.length > 0 && <table>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tracks.map((track, index) => {
                            return (<tr key={track.id}>
                                <td>{index + 1}</td>
                                <td>{track.title}</td>
                            </tr>)
                        })
                        }
                        </tbody>
                    </table>}
                </div>


            </div>
        </div>
    );
}

export default App;
