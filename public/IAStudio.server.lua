-- IA Roblox : plugin Studio
-- Colle le code généré par le site, puis choisis une action.

local CHS = game:GetService("ChangeHistoryService")
local Sel = game:GetService("Selection")

local toolbar = plugin:CreateToolbar("IA Roblox")
local button = toolbar:CreateButton("IA Roblox", "Ouvrir le panneau", "")

local info = DockWidgetPluginGuiInfo.new(Enum.InitialDockState.Right, false, false, 340, 460, 240, 260)
local widget = plugin:CreateDockWidgetPluginGui("IARoblox", info)
widget.Title = "IA Roblox"

local box = Instance.new("TextBox")
box.Size = UDim2.new(1, -10, 1, -100)
box.Position = UDim2.new(0, 5, 0, 5)
box.MultiLine = true
box.ClearTextOnFocus = false
box.TextXAlignment = Enum.TextXAlignment.Left
box.TextYAlignment = Enum.TextYAlignment.Top
box.PlaceholderText = "Colle ici le code copié depuis le site"
box.Font = Enum.Font.Code
box.TextSize = 14
box.TextColor3 = Color3.new(1, 1, 1)
box.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
box.Parent = widget

local status = Instance.new("TextLabel")
status.Size = UDim2.new(1, -10, 0, 20)
status.Position = UDim2.new(0, 5, 1, -95)
status.BackgroundTransparency = 1
status.TextColor3 = Color3.new(1, 1, 1)
status.TextXAlignment = Enum.TextXAlignment.Left
status.Text = ""
status.Parent = widget

local function makeButton(text, x, action)
	local b = Instance.new("TextButton")
	b.Size = UDim2.new(0.333, -8, 0, 50)
	b.Position = UDim2.new(x, 4, 1, -70)
	b.Text = text
	b.TextWrapped = true
	b.Parent = widget
	b.MouseButton1Click:Connect(function()
		local ok, err = pcall(action)
		status.Text = ok and "OK ✓" or ("Erreur : " .. tostring(err))
	end)
end

local function insertScript(className, parent)
	local s = Instance.new(className)
	s.Name = "Script_IA"
	s.Source = box.Text
	s.Parent = parent
	Sel:Set({ s })
	CHS:SetWaypoint("Script IA")
end

makeButton("Script serveur", 0, function()
	insertScript("Script", game:GetService("ServerScriptService"))
end)

makeButton("LocalScript (GUI)", 0.333, function()
	insertScript("LocalScript", game:GetService("StarterGui"))
end)

makeButton("Exécuter (map)", 0.666, function()
	CHS:SetWaypoint("Avant IA")
	local f, e = loadstring(box.Text)
	if not f then
		error(e)
	end
	f()
	CHS:SetWaypoint("Après IA")
end)

button.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
