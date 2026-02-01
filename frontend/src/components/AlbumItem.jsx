function AlbumItem({ album }) {
    return (
        <div className="album-item">
            <h3>{album.name}</h3>
            <p>Code: {album.code}</p>
        </div>
    );
}

export default AlbumItem;
