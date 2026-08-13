(function (exports, jsxRuntime) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    // Formatting Helpers
    function togglePrefix(text, prefix) {
        var lines = text.split('\n');
        if (lines.every(function (l) { return l.startsWith(prefix); })) {
            return lines.map(function (l) { return l.slice(prefix.length); }).join('\n');
        }
        var cleanupRegex = /^(#{1,3} |-# )/;
        return lines.map(function (l) { return prefix + l.replace(cleanupRegex, ''); }).join('\n');
    }

    function createDiscordTimestamp(secs, flag) {
        return '<t:' + secs + ':' + flag + '>';
    }

    var timestampFlags = [
        { flag: 'R', label: 'Relative', example: function () { return 'in 5 minutes'; } },
        { flag: 'F', label: 'Full date+time', example: function (s) { return new Date(s * 1000).toLocaleString(); } },
        { flag: 'f', label: 'Date + time', example: function (s) { return new Date(s * 1000).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }); } },
        { flag: 'D', label: 'Date only', example: function (s) { return new Date(s * 1000).toLocaleDateString(); } },
        { flag: 'd', label: 'Short date', example: function (s) { return new Date(s * 1000).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }); } },
        { flag: 'T', label: 'Time + secs', example: function (s) { return new Date(s * 1000).toLocaleTimeString(); } },
        { flag: 't', label: 'Short time', example: function (s) { return new Date(s * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); } }
    ];

    // Timestamp Modal Component
    function TimestampModal({ onInsert, onClose }) {
        var currentUnix = Math.floor(Date.now() / 1000);
        var React = revenge.react.React;
        var RN = revenge.react.ReactNative;

        var [inputVal, setInputVal] = React.useState(String(currentUnix));
        var [selectedFlag, setSelectedFlag] = React.useState('R');

        var numericUnix = parseInt(inputVal, 10);
        var isValid = !isNaN(numericUnix) && numericUnix > 0;

        var presets = [
            { label: 'Now', secs: currentUnix },
            { label: '+1h', secs: currentUnix + 3600 },
            { label: '+1d', secs: currentUnix + 86400 },
            { label: '+1w', secs: currentUnix + 604800 }
        ];

        return jsxRuntime.jsxs(RN.View, { style: modalStyles.modal, children: [
            jsxRuntime.jsxs(RN.View, { style: modalStyles.header, children: [
                jsxRuntime.jsx(RN.Text, { style: modalStyles.title, children: 'Insert Timestamp' }),
                jsxRuntime.jsx(RN.Pressable, { onPress: onClose, style: modalStyles.closeBtn, children: jsxRuntime.jsx(RN.Text, { style: modalStyles.closeTxt, children: '✕' }) })
            ] }),
            jsxRuntime.jsx(RN.Text, { style: modalStyles.label, children: 'Unix (seconds)' }),
            jsxRuntime.jsx(RN.TextInput, { style: modalStyles.input, value: inputVal, onChangeText: setInputVal, keyboardType: 'numeric', placeholderTextColor: '#888', placeholder: 'e.g. 1786375800' }),
            jsxRuntime.jsx(RN.View, { style: modalStyles.row, children: presets.map(function (p) {
                return jsxRuntime.jsx(RN.TouchableOpacity, { style: modalStyles.preset, onPress: function () { return setInputVal(String(p.secs)); }, children: jsxRuntime.jsx(RN.Text, { style: modalStyles.presetTxt, children: p.label }) }, p.label);
            }) }),
            jsxRuntime.jsx(RN.Text, { style: modalStyles.label, children: 'Format' }),
            jsxRuntime.jsx(RN.ScrollView, { style: modalStyles.flagList, showsVerticalScrollIndicator: false, children: timestampFlags.map(function (item) {
                return jsxRuntime.jsxs(RN.TouchableOpacity, { style: [modalStyles.flagRow, selectedFlag === item.flag && modalStyles.flagRowSelected], onPress: function () { return setSelectedFlag(item.flag); }, children: [
                    jsxRuntime.jsx(RN.View, { style: modalStyles.flagBadge, children: jsxRuntime.jsx(RN.Text, { style: modalStyles.flagBadgeTxt, children: item.flag }) }),
                    jsxRuntime.jsxs(RN.View, { style: modalStyles.flagInfo, children: [
                        jsxRuntime.jsx(RN.Text, { style: modalStyles.flagLabel, children: item.label }),
                        jsxRuntime.jsx(RN.Text, { style: modalStyles.flagExample, children: isValid ? item.example(numericUnix) : '—' })
                    ] })
                ] }, item.flag);
            }) }),
            isValid && jsxRuntime.jsx(RN.View, { style: modalStyles.preview, children: jsxRuntime.jsx(RN.Text, { style: modalStyles.previewTxt, selectable: true, children: createDiscordTimestamp(numericUnix, selectedFlag) }) }),
            jsxRuntime.jsx(RN.TouchableOpacity, { style: [modalStyles.insertBtn, !isValid && modalStyles.insertBtnDisabled], disabled: !isValid, onPress: function () { onInsert(createDiscordTimestamp(numericUnix, selectedFlag)); onClose(); }, children: jsxRuntime.jsx(RN.Text, { style: modalStyles.insertTxt, children: 'Insert' }) })
        ] });
    }

    // Styles Configuration 
    var modalStyles = revenge.react.ReactNative.StyleSheet.create({
        modal: { backgroundColor: '#1e1f22', borderRadius: 16, padding: 16, margin: 12, maxHeight: '90%' },
        header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
        title: { color: '#fff', fontSize: 18, fontWeight: '700' },
        closeBtn: { padding: 4 },
        closeTxt: { color: '#aaa', fontSize: 18 },
        label: { color: '#aaa', fontSize: 12, marginBottom: 4, marginTop: 8 },
        input: { backgroundColor: '#2b2d31', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15 },
        row: { flexDirection: 'row', gap: 8, marginTop: 8 },
        preset: { flex: 1, backgroundColor: '#2b2d31', borderRadius: 8, alignItems: 'center', paddingVertical: 7 },
        presetTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
        flagList: { maxHeight: 220 },
        flagRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4 },
        flagRowSelected: { backgroundColor: '#404249' },
        flagBadge: { backgroundColor: '#5865f2', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, marginRight: 10 },
        flagBadgeTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
        flagInfo: { flex: 1 },
        flagLabel: { color: '#fff', fontWeight: '600', fontSize: 14 },
        flagExample: { color: '#aaa', fontSize: 12 },
        preview: { backgroundColor: '#2b2d31', borderRadius: 8, padding: 10, marginTop: 10, alignItems: 'center' },
        previewTxt: { color: '#5865f2', fontSize: 15 },
        insertBtn: { backgroundColor: '#5865f2', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
        insertBtnDisabled: { opacity: 0.4 },
        insertTxt: { color: '#fff', fontWeight: '700', fontSize: 16 }
    });

    // Toolbar Interface Component
    function ToolbarComponent({ channelId }) {
        var React = revenge.react.React;
        var RN = revenge.react.ReactNative;
        var [modalOpen, setModalOpen] = React.useState(false);

        var draftFinder = revenge.modules.finders.findByProps('getDraft');
        var draftSaver = revenge.modules.finders.findByProps('saveDraft', 'clearDraft');

        function getCurrentDraft() {
            return draftFinder?.getDraft?.(channelId, 0) ?? '';
        }

        function updateDraft(content) {
            draftSaver?.saveDraft?.({ channelId: channelId, type: 0, draft: content });
        }

        function handlePrefixClick(prefix) {
            var current = getCurrentDraft();
            updateDraft(current.trim() ? togglePrefix(current, prefix) : prefix);
        }

        function handleInsertText(text) {
            var current = getCurrentDraft();
            updateDraft(current ? current + ' ' + text : text);
        }

        return jsxRuntime.jsxs(RN.View, { style: barStyles.container, children: [
            [{ label: '# H1', prefix: '# ' }, { label: '## H2', prefix: '## ' }, { label: '### H3', prefix: '### ' }, { label: '-# sm', prefix: '-# ' }].map(function (item) {
                return jsxRuntime.jsx(RN.TouchableOpacity, { style: barStyles.btn, onPress: function () { return handlePrefixClick(item.prefix); }, children: jsxRuntime.jsx(RN.Text, { style: barStyles.btnTxt, children: item.label }) }, item.prefix);
            }),
            jsxRuntime.jsx(RN.View, { style: barStyles.divider }),
            jsxRuntime.jsx(RN.TouchableOpacity, { style: [barStyles.btn, barStyles.tsBtn], onPress: function () { return setModalOpen(true); }, children: jsxRuntime.jsx(RN.Text, { style: barStyles.btnTxt, children: '⏱ ts' }) }),
            jsxRuntime.jsx(RN.Modal, { visible: modalOpen, transparent: true, animationType: 'slide', onRequestClose: function () { return setModalOpen(false); }, children: jsxRuntime.jsx(RN.View, { style: barStyles.overlay, children: jsxRuntime.jsx(TimestampModal, { onInsert: handleInsertText, onClose: function () { return setModalOpen(false); } }) }) })
        ] });
    }

    var barStyles = revenge.react.ReactNative.StyleSheet.create({
        container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#2b2d31', borderTopWidth: 1, borderTopColor: '#1e1f22', flexWrap: 'wrap', gap: 4 },
        btn: { backgroundColor: '#404249', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
        tsBtn: { backgroundColor: '#5865f240' },
        btnTxt: { color: '#fff', fontSize: 12, fontWeight: '600' },
        divider: { width: 1, height: 20, backgroundColor: '#555', marginHorizontal: 2 },
        overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' }
    });

// Unified Plugin Export Patternvar pluginDefinition = {start: function () {var ChatInputModule = revenge.modules.finders.findByProps('ChatInput') || revenge.modules.finders.findByName('ChatInput');var TargetComponent = ChatInputModule?.ChatInput || ChatInputModule;if (!TargetComponent) {console.warn('[message-tools] Target input component tree not resolved.');return;}revenge.patcher.after('render', TargetComponent.prototype || TargetComponent, function (args, res) {var channelId = args?.[0]?.channelId || res?.props?.channelId || '';if (!channelId || !res) return res;return revenge.react.React.createElement(revenge.react.ReactNative.View,{ style: { flex: 1 } },revenge.react.React.createElement(ToolbarComponent, { channelId: channelId }),res);});},stop: function () {revenge.patcher.unpatchAll();}};// Standard client fallback checkif (typeof plugin === 'function') {exports.default = plugin(pluginDefinition);} else {exports.default = pluginDefinition;}return exports;})({}, revenge.react.ReactJSXRuntime);