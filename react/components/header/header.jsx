import styles from './header.module.css'
import { User } from '../User/userBlock'
import { useNavigate } from 'react-router-dom';
import logo from '../../imgs/герб_ямала.png';

export const Header = () => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
    };
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <img
                    src={logo}
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                />
                <h1 className={styles.title}>ГБУ «Городская больница Волновахского района»</h1>
                <img
                    src={logo}
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </div>
    )
}