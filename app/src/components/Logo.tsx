import { useNavigate } from 'react-router-dom';

export const Logo = ({ userName }: { userName: string }) => {
	const navigate = useNavigate();
	return (
		<div className='logo' onClick={() => navigate('/')}>
			<span>🍳</span>
			<h1>Panelinha do {userName}</h1>
		</div>
	)
}