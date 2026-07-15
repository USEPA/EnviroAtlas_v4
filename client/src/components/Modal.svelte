<script>
	// Import calcite components
	import "@esri/calcite-components/dist/components/calcite-dialog";

	let modal;
</script>

<calcite-dialog
	bind:this={modal}
	open
	modal
	closeDisabled
	id="example-modal"
	scale="s"
>
	<calcite-tabs layout="center">
		<calcite-tab-nav slot="title-group">
			<calcite-tab-title selected style="font-size: 16px"> Welcome </calcite-tab-title>
			<calcite-tab-title style="font-size: 16px">Disclaimer</calcite-tab-title>
		</calcite-tab-nav>
		<calcite-tab selected
			><div class="welcome-layout">
				<div class="welcome-copy">
					<b class="welcome-title">Welcome to</b>
					<b class="welcome-title">the EnviroAtlas Interactive Map!</b
					>
					<p class="splash-text">
						This new beta version of the EnviroAtlas Interactive Map
						is a discovery and analysis tool for data layers
						relating to the benefits people receive from their
						environment.
					</p>
					<p class="splash-text">
						The data can help inform decisions related to
						environmental management, human well-being, and the
						economy.
					</p>
					<p class="splash-text">
						By using the EnviroAtlas Interactive Map, you
						acknowledge the limitations outlined in the disclaimer.
					</p>
				</div>
				<div class="welcome-image-wrap">
					<img
						class="welcome-image"
						src="/ea/client/images/Wheel_AMJ.png"
						alt="EnviroAtlas wheel graphic"
					/>
				</div>
			</div>
		</calcite-tab>
		<calcite-tab
			><ul>
				<li>
					<b
						>It is the responsibility of the user to read and
						evaluate data limitations and restrictions especially
						with regard to intended use.</b
					> To the best of our knowledge, the data and information on this
					website are as accurate as possible, but no warranty expressed
					or implied is made regarding the accuracy or utility of the data
					for general or scientific purposes, nor shall the act of distribution
					constitute any such warranty. All modeled geographic data are,
					by their nature, imperfect; the data provided in EnviroAtlas
					should not be taken as absolute truth but as the best approximation
					of the truth based on best available data.
				</li>
				<li>
					<b
						>Neither EPA, EPA contractors, nor any other
						organizations cooperating with EPA assume any
						responsibility for damages or other liabilities</b
					> related to the accuracy, availability, use or misuse of the
					information provided on this website. EPA reserves the right
					to change information at any time without public notice. Any
					errors or omissions should be reported to the EnviroAtlas Team.
					We are always happy to hear your feedback and use that feedback
					for future enhancements.
				</li>
				<li>
					<b
						>For site-specific data, EnviroAtlas data will not
						replace “boots-on-the-ground measurements” or local
						knowledge.
					</b>Better data may be available from local sources.
				</li>
			</ul>
		</calcite-tab>
	</calcite-tabs>
	<calcite-button
		slot="footer-end"
		style="font-size: 16px"
		on:click={() => modal.removeAttribute("open")}>I agree</calcite-button
	>
</calcite-dialog>

<style>
	calcite-button {
		--calcite-button-background-color: white;
		--calcite-button-text-color: black
	}

	calcite-dialog {
		--calcite-dialog-scrim-background-color: rgba(83, 83, 83, 0.75);
		--calcite-dialog-background-color: #162e51;
		--calcite-dialog-footer-background-color: #162e51;
		--calcite-dialog-heading-text-color: white;
		--calcite-dialog-description-text-color: white;
		color: white;
		--calcite-dialog-header-action-text-color-press: white
	}

	calcite-tab,
	calcite-tab p,
	calcite-tab ul,
	calcite-tab li,
	calcite-tab b {
		color: white;
	}

	.welcome-layout {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding-left: 1.5rem;
	}

	.welcome-copy,
	.welcome-image-wrap {
		flex: 1 1 50%;
	}
	.splash-text {
		font-size: 16px;
		line-height: 1.25em;
	}

	.welcome-title {
		display: block;
		line-height: 1.25em;
		font-size: 21px;
		text-align: center;
		transform: translateX(-15px);
	}

	.welcome-image-wrap {
		display: flex;
		justify-content: center;
	}

	.welcome-image {
		max-width: 100%;
		height: auto;
	}

	@media (max-width: 700px) {
		.welcome-layout {
			flex-direction: column;
			text-align: center;
		}
	}

	calcite-tab-title {
		--calcite-tab-text-color: white;
		--calcite-color-text-1: white
	}
</style>
