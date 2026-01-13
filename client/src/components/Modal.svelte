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
			<calcite-tab-title selected> Welcome </calcite-tab-title>
			<calcite-tab-title>Disclaimer</calcite-tab-title>
		</calcite-tab-nav>
		<calcite-tab selected
			><div style="margin: 0px 15px 0px 15px">
				<br />
				<p style="font-size:14px; text-align:center">
					Welcome! The EnviroAtlas Interactive Map is a discovery and
					analysis tool for hundreds of data layers relating to
					ecosystem services, biodiversity, people, and the built
					environment.
				</p>
				<br /><br />
				By using the EnviroAtlas interactive map, you acknowledge the limitations
				outlined in our disclaimer.
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
		on:click={() => modal.removeAttribute("open")}>OK</calcite-button
	>
</calcite-dialog>

<style>
	calcite-dialog {
		--calcite-dialog-scrim-background-color: rgba(83, 83, 83, 0.75);
	}
</style>
