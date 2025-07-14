import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Flex } from '@radix-ui/themes';
import { LuArrowLeft, LuSearchX } from 'react-icons/lu';

const NotFoundPage: React.FC = () => {
	const navigate = useNavigate();

	return (
		<section className="not-found">
			<Card size={'4'} className="not-found-card">
				<Flex direction={'column'} align={'center'} gap={'4'}>
					<LuSearchX size={64} />
					<h1>404 - Página não encontrada</h1>
					<div className="not-found-message">
						<p>🤔 Ops! Parece que você se perdeu no feed...</p>
						<p>Esta página decidiu tirar umas férias e não voltou ainda.</p>
					</div>
					<Button onClick={() => navigate('/')} size="3">
						<LuArrowLeft />
						Voltar para o início
					</Button>
				</Flex>
			</Card>
		</section>
	);
};

export default NotFoundPage;
