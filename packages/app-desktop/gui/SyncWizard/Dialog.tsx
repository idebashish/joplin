import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { _ } from '@joplin/lib/locale';
import DialogButtonRow from '../DialogButtonRow';
import Dialog from '../Dialog';
import styled from 'styled-components';
import DialogTitle from '../DialogTitle';
import SyncTargetRegistry, { SyncTargetInfo } from '@joplin/lib/SyncTargetRegistry';
import useElementSize from '@joplin/lib/hooks/useElementSize';
import Button, { ButtonLevel } from '../Button/Button';
import bridge from '../../services/bridge';
import StyledInput from '../style/StyledInput';
import Setting from '../../../lib/models/Setting';
import SyncTargetJoplinCloud from '../../../lib/SyncTargetJoplinCloud';

interface Props {
	themeId: number;
	dispatch: Function;
}

const StyledRoot = styled.div`
	min-width: 500px;
	max-width: 1200px;
`;

const TopTitle = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 0.8em;
	margin-bottom: 1.8em;
`;

const SyncTargetDescription = styled.div`
	${props => props.height ? `height: ${props.height}px` : ''};
	margin-bottom: 1.3em;
	line-height: ${props => props.theme.lineHeight};
`;

const ContentRoot = styled.div`
	background-color: ${props => props.theme.backgroundColor3};
	padding: 1em;
	padding-right: 0;
`;

const SyncTargetBoxes = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
`;

const SyncTargetTitle = styled.p`
	display: flex;
	flex-direction: row;
	font-weight: bold;
	font-size: 1.7em;
	align-items: center;
	white-space: nowrap;
`;

const SyncTargetLogo = styled.img`
	height: 1.3em;
	margin-right: 0.4em;
`;

const SyncTargetBox = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	font-family: ${props => props.theme.fontFamily};
	color: ${props => props.theme.color};
	background-color: ${props => props.theme.backgroundColor};
	border: 1px solid ${props => props.theme.dividerColor};
	border-radius: 8px;
	padding: 1em 2.2em 2em 2.2em;
	margin-right: 1em;
	max-width: 400px;
	opacity: ${props => props.faded ? 0.5 : 1};
`;

const FeatureList = styled.div`
	margin-bottom: 1em;
`;

const FeatureIcon = styled.i`
	display: inline-flex;
	width: 16px;
	justify-content: center;
	color: ${props => props.theme.color4};
	position: absolute;
`;

const FeatureLine = styled.div`
	margin-bottom: .5em;
	opacity: ${props => props.enabled ? 1 : 0.5};
	position: relative;
`;

const FeatureLabel = styled.div`
	margin-left: 24px;
	line-height: ${props => props.theme.lineHeight};
`;

const SelectButton = styled(Button)`
	padding: 10px 10px;
    height: auto;
    min-height: auto;
    max-height: fit-content;
    font-size: 1em;
`;

const JoplinCloudLoginForm = styled.div`
	display: flex;
	flex-direction: column;
`;

const FormLabel = styled.label`
	font-weight: bold;
	margin: 1em 0 0.6em 0;
`;

const syncTargetNames: string[] = [
	'joplinCloud',
	'dropbox',
	'onedrive',
	'nextcloud',
	'webdav',
	'amazon_s3',
	'joplinServer',
];


const logosImageNames: Record<string, string> = {
	'dropbox': 'Dropbox.svg',
	'joplinCloud': 'JoplinCloud.svg',
	'onedrive': 'OneDrive.svg',
};

export default function(props: Props) {
	const [showJoplinCloudForm, setShowJoplinCloudForm] = useState(false);
	const joplinCloudDescriptionRef = useRef(null);
	const [joplinCloudEmail, setJoplinCloudEmail] = useState('');
	const [joplinCloudPassword, setJoplinCloudPassword] = useState('');

	function closeDialog(dispatch: Function) {
		dispatch({
			type: 'DIALOG_CLOSE',
			name: 'syncWizard',
		});
	}

	const onButtonRowClick = useCallback(() => {
		closeDialog(props.dispatch);
	}, [props.dispatch]);

	const { height: descriptionHeight } = useElementSize(joplinCloudDescriptionRef);

	function renderFeature(enabled: boolean, label: string) {
		const className = enabled ? 'fas fa-check' : 'fas fa-times';
		return (
			<FeatureLine enabled={enabled} key={label}><FeatureIcon className={className}></FeatureIcon> <FeatureLabel>{label}</FeatureLabel></FeatureLine>
		);
	}

	function renderFeatures(name: string) {
		return (
			<FeatureList>
				{[
					renderFeature(true, _('Sync your notes')),
					renderFeature(name === 'joplinCloud', _('Publish notes to the internet')),
					renderFeature(name === 'joplinCloud', _('Collaborate on notebooks with others')),
				]}
			</FeatureList>
		);
	}

	const onJoplinCloudEmailChange = useCallback((event: any) => {
		setJoplinCloudEmail(event.target.value);
	}, []);

	const onJoplinCloudPasswordChange = useCallback((event: any) => {
		console.info(event.target.value);
		setJoplinCloudPassword(event.target.value);
	}, []);

	const onJoplinCloudLoginClick = useCallback(async () => {
		const result = await SyncTargetJoplinCloud.checkConfig({
			password: () => joplinCloudPassword,
			path: () => Setting.value('sync.10.path'),
			userContentPath: () => Setting.value('sync.10.userContentPath'),
			username: () => joplinCloudEmail,
		});

		if (result.ok) {
			Setting.setValue('sync.target', 10);
			Setting.setValue('sync.10.username', joplinCloudEmail);
			Setting.setValue('sync.10.password', joplinCloudPassword);
			await Setting.saveAll();

			alert(_('Thank you! Your Joplin Cloud account is now setup and ready to use.'));

			closeDialog(props.dispatch);
		} else {
			alert(_('There was an error setting up your Joplin Cloud account. Please verify your email and password and try again. Error was:\n\n%s', result.errorMessage));
		}
	}, [joplinCloudEmail, joplinCloudPassword, props.dispatch]);

	function renderJoplinCloudLoginForm() {
		return (
			<JoplinCloudLoginForm>
				<div>Login below, or <a href="#">create an account</a>.</div>
				<FormLabel>Email</FormLabel>
				<StyledInput type="email" onChange={onJoplinCloudEmailChange}/>
				<FormLabel>Password</FormLabel>
				<StyledInput type="password" onChange={onJoplinCloudPasswordChange}/>
				<SelectButton mt="1.3em" level={ButtonLevel.Primary} title={_('Login')} onClick={onJoplinCloudLoginClick}/>
			</JoplinCloudLoginForm>
		);
	}

	const onSelectButtonClick = useCallback(async (name: string) => {
		if (name === 'joplinCloud') {
			setShowJoplinCloudForm(true);
		} else {
			Setting.setValue('sync.target', name === 'dropbox' ? 7 : 3);
			await Setting.saveAll();
			closeDialog(props.dispatch);
			props.dispatch({
				type: 'NAV_GO',
				routeName: name === 'dropbox' ? 'DropboxLogin' : 'OneDriveLogin',
			});
		}
	}, [props.dispatch]);

	function renderSelectArea(info: SyncTargetInfo) {
		if (info.name === 'joplinCloud' && showJoplinCloudForm) {
			return renderJoplinCloudLoginForm();
		} else {
			return (
				<SelectButton
					level={ButtonLevel.Primary}
					title={_('Select')}
					onClick={() => onSelectButtonClick(info.name)}
				/>
			);
		}
	}

	function renderSyncTarget(info: SyncTargetInfo) {
		const key = `syncTarget_${info.name}`;
		const height = info.name !== 'joplinCloud' ? descriptionHeight : null;

		const logoImageName = logosImageNames[info.name];
		const logoImageSrc = logoImageName ? `${bridge().buildDir()}/images/syncTargetLogos/${logoImageName}` : '';
		const logo = logoImageSrc ? <SyncTargetLogo src={logoImageSrc}/> : null;
		const descriptionComp = <SyncTargetDescription height={height} ref={info.name === 'joplinCloud' ? joplinCloudDescriptionRef : null}>{info.description}</SyncTargetDescription>;
		const featuresComp = showJoplinCloudForm && info.name === 'joplinCloud' ? null : renderFeatures(info.name);

		return (
			<SyncTargetBox id={key} key={key} faded={showJoplinCloudForm && info.name !== 'joplinCloud'}>
				<SyncTargetTitle>{logo}{info.label}</SyncTargetTitle>
				{descriptionComp}
				{featuresComp}
				{renderSelectArea(info)}
			</SyncTargetBox>
		);
	}

	function renderContent() {
		const boxes: any[] = [];

		for (const name of syncTargetNames) {
			const info = SyncTargetRegistry.infoByName(name);
			if (info.supportsSelfHosted) continue;
			boxes.push(renderSyncTarget(info));
		}

		const selfHostingMessage = showJoplinCloudForm ? null : <p>Self-hosting? Joplin also supports various self-hosting options such as Nextcloud, WebDAV, AWS S3 and Joplin Server. <a href="#">Click here to select one</a></p>;

		return (
			<ContentRoot>
				<TopTitle>{_('Joplin can synchronise your notes using various providers. Select one from the list below:')}</TopTitle>
				<SyncTargetBoxes>
					{boxes}
				</SyncTargetBoxes>
				{selfHostingMessage}
			</ContentRoot>
		);
	}

	function renderDialogWrapper() {
		return (
			<StyledRoot>
				<DialogTitle title={_('Synchronisation Wizard')} justifyContent="center"/>
				{renderContent()}
				<DialogButtonRow
					themeId={props.themeId}
					onClick={onButtonRowClick}
					okButtonShow={false}
					cancelButtonLabel={_('Close')}
				/>
			</StyledRoot>
		);
	}

	return (
		<Dialog renderContent={renderDialogWrapper}/>
	);
}
