export default function ArcadeGame() {
    return (
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
            <iframe
                src="/arcade.html"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Arcade Game"
            ></iframe>
        </div>
    );
}
