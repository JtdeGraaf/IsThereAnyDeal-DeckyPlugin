import { showModal, ModalRoot } from 'decky-frontend-lib';
import { QRCodeSVG } from 'qrcode.react';


/**
 * Complete copy of https://github.com/SteamGridDB/decky-steamgriddb/blob/main/src/utils/showQrModal.tsx
 */
const showQrModal = (url: string) => {
    showModal(
        <ModalRoot>
            <QRCodeSVG
                style={{ margin: '0 auto 1.5em auto' }}
                value={url}
                includeMargin
                size={256}
            />
            <span style={{ textAlign: 'center', wordBreak: 'break-word' }}>{url}</span>
        </ModalRoot>,
        window
    );
};

export default showQrModal;