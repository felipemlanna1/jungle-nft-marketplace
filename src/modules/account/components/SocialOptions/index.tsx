import type { SocialOptionsProps } from '../../shared-types';
export function SocialOptions({ onSelect }: SocialOptionsProps) {
  return (
    <div className="social-options">
      <div className="auth-divider">
        <span>Ou continue com</span>
      </div>
      <button type="button" className="social-button" onClick={() => onSelect('Google')}>
        <span className="google-icon" aria-hidden="true">
          <img className="google-part-0" src="/figma/login/imgVector.svg" alt="" />
          <img className="google-part-1" src="/figma/login/imgVector1.svg" alt="" />
          <img className="google-part-2" src="/figma/login/imgGroup.svg" alt="" />
          <img className="google-part-3" src="/figma/login/imgVector2.svg" alt="" />
          <img className="google-part-4" src="/figma/login/imgVector3.svg" alt="" />
          <img className="google-part-5" src="/figma/login/imgVector4.svg" alt="" />
          <img className="google-part-6" src="/figma/login/imgVector5.svg" alt="" />
        </span>
        Continuar com Google
      </button>
      <button type="button" className="social-button" onClick={() => onSelect('Facebook')}>
        <span className="facebook-icon" aria-hidden="true">
          <img src="/figma/login/imgFacebook1.svg" alt="" />
        </span>
        Continuar com Facebook
      </button>
    </div>
  );
}
