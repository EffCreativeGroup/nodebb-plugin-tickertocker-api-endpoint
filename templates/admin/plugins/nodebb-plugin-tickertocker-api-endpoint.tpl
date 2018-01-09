<div class="row">
	<div class="col-lg-5">
		<div class="panel panel-warning">
			<div class="panel-heading"></div>
			<div class="panel-body">
				This plugin need installed and turned on session-sharing plugin to correct work!
			</div>
		</div>
		<div class="panel panel-default">
			<div class="panel-heading">TickerTocker API Settings</div>
			<div class="panel-body">
				<form role="form" class="ttapi-settings">
					<div class="form-group">
						<label for="ttapi:host">Host</label>
						<input type="text" class="form-control" name="ttapi:host" id="ttapi:host" />
					</div>
					<div class="form-group">
						<label for="ttapi:apiUrlCurrentUser">Relative URL of tickertocker method get current user</label>
						<input type="text" class="form-control" name="ttapi:apiUrlCurrentUser" id="ttapi:apiUrlCurrentUser" placeholder="Default:/api/v1/user/current" />
					</div>
					<p class="help-block">
						For authorization in the header, you need to pass a user token (from tickertocker) (with the role of administrator).<br>
						<code>Authorization: Bearer `token`</code>
					</p>
				</form>
				<button type="button" class="pull-right btn btn-primary" id="save">Save</button>
			</div>
		</div>
	</div>
	<div class="col-lg-7">
		<div class="row">
			<div class="col-xs-12">
				<div class="panel panel-default">
					<div class="panel-heading">API Documentation</div>
					<div class="panel-body">
                        {documentation}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
