import React from "react";
import "./SharePopup.css";

type Props = {
	imageUrl: string;
	onClose?: () => void;
};

export default function SharePopup({ imageUrl, onClose }: Props) {
	const shareToFacebook = () => {
		const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
			imageUrl
		)}`;
		window.open(url, "_blank", "noopener");
		onClose?.();
	};

	const shareToInstagram = async () => {
		// Try Web Share API first (works on mobile with Instagram present)
		if (navigator.share) {
			try {
				await navigator.share({
					title: "Shared image",
					url: imageUrl,
				});
				onClose?.();
				return;
			} catch {
				/* fall through to fallback */
			}
		}
		// Instagram does not have an official web share URL for arbitrary links,
		// fallback to opening Instagram (user can paste / post the image there).
		const url = `https://www.instagram.com/?url=${encodeURIComponent(imageUrl)}`;
		window.open(url, "_blank", "noopener");
		onClose?.();
	};

	return (
		<div className="share-popup" role="dialog" aria-label="Share image">
			<button className="share-btn fb" onClick={shareToFacebook}>
				Share to Facebook
			</button>
			<button className="share-btn ig" onClick={shareToInstagram}>
				Share to Instagram
			</button>
		</div>
	);
}
