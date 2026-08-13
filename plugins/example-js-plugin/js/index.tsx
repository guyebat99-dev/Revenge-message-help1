import { findByName, findByProps } from '@revenge-mod/modules/finders'
import { after } from '@revenge-mod/patcher'
import React from 'react'
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

function applySize(text: string, prefix: string): string {
	const lines = text.split('\n')
	const allPrefixed = lines.every(l => l.startsWith(prefix))
	if (allPrefixed) return lines.map(l => l.slice(prefix.length)).join('\n')
	const headingRe = /^(#{1,3} |-# )/
	return lines.map(l => prefix + l.replace(headingRe, '')).join('\n')
}

function buildTimestamp(unixSeconds: number, flag: string): string {
	return `<t:${unixSeconds}:${flag}>`
}

const FLAGS = [
	{ flag: 'R', label: 'Relative',       example: (_: number) => 'in 5 minutes' },
	{ flag: 'F', label: 'Full date+time', example: (ts: number) => new Date(ts * 1000).toLocaleString() },
	{ flag: 'f', label: 'Date + time',    example: (ts: number) => new Date(ts * 1000).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }) },
	{ flag: 'D', label: 'Date only',      example: (ts: number) => new Date(ts * 1000).toLocaleDateString() },
	{ flag: 'd', label: 'Short date',     example: (ts: number) => new Date(ts * 1000).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) },
	{ flag: 'T', label: 'Time + secs',    example: (ts: number) => new Date(ts * 1000).toLocaleTimeString() },
	{ flag: 't', label: 'Short time',     example: (ts: number) => new Date(ts * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) },
]

function TimestampPicker({ onInsert, onClose }: { onInsert: (s: string) => void; onClose: () => void }) {
	const nowSecs = Math.floor(Date.now() / 1000)
	const [unix, setUnix] = React.useState(String(nowSecs))
	const [selectedFlag, setSelectedFlag] = React.useState('R')
	const parsedUnix = parseInt(unix, 10)
	const isValid = !isNaN(parsedUnix) && parsedUnix > 0
	const presets = [
		{ label: 'Now', secs: nowSecs },
		{ label: '+1h', secs: nowSecs + 3600 },
		{ label: '+1d', secs: nowSecs + 86400 },
		{ label: '+1w', secs: nowSecs + 604800 },
	]
	return (
		<View style={ts.modal}>
			<View style={ts.header}>
				<Text style={ts.title}>Insert Timestamp</Text>
				<Pressable onPress={onClose} style={ts.closeBtn}><Text style={ts.closeTxt}>✕</Text></Pressable>
			</View>
			<Text style={ts.label}>Unix (seconds)</Text>
			<TextInput style={ts.input} value={unix} onChangeText={setUnix} keyboardType="numeric" placeholderTextColor="#888" placeholder="e.g. 1786375800" />
			<View style={ts.row}>
				{presets.map(p => (
					<TouchableOpacity key={p.label} style={ts.preset} onPress={() => setUnix(String(p.secs))}>
						<Text style={ts.presetTxt}>{p.label}</Text>
					</TouchableOpacity>
				))}
			</View>
			<Text style={ts.label}>Format</Text>
			<ScrollView style={ts.flagList} showsVerticalScrollIndicator={false}>
				{FLAGS.map(f => (
					<TouchableOpacity key={f.flag} style={[ts.flagRow, selectedFlag === f.flag && ts.flagRowSelected]} onPress={() => setSelectedFlag(f.flag)}>
						<View style={ts.flagBadge}><Text style={ts.flagBadgeTxt}>{f.flag}</Text></View>
						<View style={ts.flagInfo}>
							<Text style={ts.flagLabel}>{f.label}</Text>
							<Text style={ts.flagExample}>{isValid ? f.example(parsedUnix) : '—'}</Text>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
			{isValid && <View style={ts.preview}><Text style={ts.previewTxt} selectable>{buildTimestamp(parsedUnix, selectedFlag)}</Text></View>}
			<TouchableOpacity style={[ts.insertBtn, !isValid && ts.insertBtnDisabled]} disabled={!isValid} onPress={() => { onInsert(buildTimestamp(parsedUnix, selectedFlag)); onClose() }}>
				<Text style={ts.insertTxt}>Insert</Text>
			</TouchableOpacity>
		</View>
	)
}

const ts = StyleSheet.create({
	modal:             { backgroundColor: '#1e1f22', borderRadius: 16, padding: 16, margin: 12, maxHeight: '90%' },
	header:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
	title:             { color: '#fff', fontSize: 18, fontWeight: '700' },
	closeBtn:          { padding: 4 },
	closeTxt:          { color: '#aaa', fontSize: 18 },
	label:             { color: '#aaa', fontSize: 12, marginBottom: 4, marginTop: 8 },
	input:             { backgroundColor: '#2b2d31', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15 },
	row:               { flexDirection: 'row', gap: 8, marginTop: 8 },
	preset:            { flex: 1, backgroundColor: '#2b2d31', borderRadius: 8, alignItems: 'center', paddingVertical: 7 },
	presetTxt:         { color: '#fff', fontSize: 13, fontWeight: '600' },
	flagList:          { maxHeight: 220 },
	flagRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4 },
	flagRowSelected:   { backgroundColor: '#404249' },
	flagBadge:         { backgroundColor: '#5865f2', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, marginRight: 10 },
	flagBadgeTxt:      { color: '#fff', fontWeight: '700', fontSize: 13 },
	flagInfo:          { flex: 1 },
	flagLabel:         { color: '#fff', fontWeight: '600', fontSize: 14 },
	flagExample:       { color: '#aaa', fontSize: 12 },
	preview:           { backgroundColor: '#2b2d31', borderRadius: 8, padding: 10, marginTop: 10, alignItems: 'center' },
	previewTxt:        { color: '#5865f2', fontFamily: Platform.select({ android: 'monospace', ios: 'Courier' }), fontSize: 15 },
	insertBtn:         { backgroundColor: '#5865f2', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
	insertBtnDisabled: { opacity: 0.4 },
	insertTxt:         { color: '#fff', fontWeight: '700', fontSize: 16 },
})

function MessageToolsBar({ channelId }: { channelId: string }) {
	const [tsVisible, setTsVisible] = React.useState(false)
	const DraftStore = findByProps('getDraft') as any
	const DraftActions = findByProps('saveDraft', 'clearDraft') as any
	function getDraft(): string { return DraftStore?.getDraft?.(channelId, 0) ?? '' }
	function setDraft(text: string) { DraftActions?.saveDraft?.({ channelId, type: 0, draft: text }) }
	function applyFormatting(prefix: string) {
		const current = getDraft()
		setDraft(!current.trim() ? prefix : applySize(current, prefix))
	}
	function insertTimestamp(stamp: string) {
		const current = getDraft()
		setDraft(current ? `${current} ${stamp}` : stamp)
	}
	const SIZE_BUTTONS = [
		{ label: '# H1',   prefix: '# ' },
		{ label: '## H2',  prefix: '## ' },
		{ label: '### H3', prefix: '### ' },
		{ label: '-# sm',  prefix: '-# ' },
	]
	return (
		<View style={bar.container}>
			{SIZE_BUTTONS.map(b => (
				<TouchableOpacity key={b.prefix} style={bar.btn} onPress={() => applyFormatting(b.prefix)}>
					<Text style={bar.btnTxt}>{b.label}</Text>
				</TouchableOpacity>
			))}
			<View style={bar.divider} />
			<TouchableOpacity style={[bar.btn, bar.tsBtn]} onPress={() => setTsVisible(true)}>
				<Text style={bar.btnTxt}>⏱ ts</Text>
			</TouchableOpacity>
			<Modal visible={tsVisible} transparent animationType="slide" onRequestClose={() => setTsVisible(false)}>
				<View style={bar.overlay}>
					<TimestampPicker onInsert={insertTimestamp} onClose={() => setTsVisible(false)} />
				</View>
			</Modal>
		</View>
	)
}

const bar = StyleSheet.create({
	container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#2b2d31', borderTopWidth: 1, borderTopColor: '#1e1f22', flexWrap: 'wrap', gap: 4 },
	btn:       { backgroundColor: '#404249', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
	tsBtn:     { backgroundColor: '#5865f240' },
	btnTxt:    { color: '#fff', fontSize: 12, fontWeight: '600' },
	divider:   { width: 1, height: 20, backgroundColor: '#555', marginHorizontal: 2 },
	overlay:   { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
})

export default plugin({
	start() {
		const ChatInput = findByName('ChatInput') ?? (findByProps('ChatInput') as any)?.ChatInput
		if (!ChatInput) { console.warn('[message-tools] ChatInput not found'); return }
		after('render', ChatInput.prototype ?? ChatInput, (args: any[], res: any) => {
			const channelId: string = args?.[0]?.channelId ?? res?.props?.channelId ?? ''
			if (!channelId || !res) return res
			return React.createElement(View, { style: { flex: 1 } },
				React.createElement(MessageToolsBar, { channelId }),
				res,
			)
		})
	},
	stop() {},
})
