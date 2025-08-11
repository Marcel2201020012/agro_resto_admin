export const Background = ({bg}) => {
    return (
        <div
            className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bg})` }}
        ></div>
    );
}