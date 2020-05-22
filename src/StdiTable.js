class StdiTable extends UIComponent {
	constructor(csvData, stubColumnCount, maxRowsByTable) {
		super()
		this.csvData = csvData
		this.stubColumnCount = stubColumnCount
		this.maxRowsByTable = maxRowsByTable || 100

		this.currentTableIndex = 0
		this._tableCount = null

		this._tableContainer = null
		this._navigation = null

		this._bodyPlusElement = null
		this._bodyElement = null

		this.selectingRowElement = null
		this.selectRowAction = (rowData, rowElement, rowIndex) => {}
	}

	createComponent() {
		let c = super.createComponent()
		this.tableContainer().appendTo(c)
		this.navigation().appendTo(c)
		return c
	}
// crushed when set left to value. 2020-05-21 Safari Version 13.1 (macOS 10.15.4)
//	appendTo(toComponent) {
//		super.appendTo(toComponent)
//		let stubs = this.component().getElementsByClassName('stub')
//		for (var i = 0; i < stubs.length; i += 1) {
//			let stub = stubs.item(i)
//			stub.style.left = stub.getBoundingClientRect().left + 'px'
//		}
//	}
	tableCount() {
		if (this._tableCount == null) {

			this._tableCount = Math.floor(this.csvData.data.length / this.maxRowsByTable)
			if (this.csvData.data.length - this._tableCount * this.maxRowsByTable > 0) {
				this._tableCount += 1
			}
		}
		return this._tableCount
	}
	navigation() {
		if (this._navigation) {
			return this._navigation
		}
		let naviComponent = new UIComponent(),
			prevButton = ButtonComponent.PreviousButton((b) => {
				this.currentTableIndex = Math.max(0, this.currentTableIndex - 1)
				this.updateTable()
				tableNumberInput.value(this.currentTableIndex + 1, b)
			}),
			nextButton = ButtonComponent.NextButton((b) => {
				this.currentTableIndex = Math.min(this.currentTableIndex + 1, this.tableCount() - 1)
				this.updateTable()
				tableNumberInput.value(this.currentTableIndex + 1, b)
			}),
			tableNumberInput = new InputNumberComponent('', this.currentTableIndex + 1, 1, '', (value) => {
				return Math.max(1, Math.min(this.tableCount(), value))
			}, (input) => {
				this.currentTableIndex = input.value() - 1
				this.updateTable()
			})
		naviComponent.component().classList.add('navigation')
		prevButton.appendTo(naviComponent.component())
		tableNumberInput.appendTo(naviComponent.component())
		nextButton.appendTo(naviComponent.component())
		this._navigation = naviComponent
		return naviComponent
	}
	tableContainer() {
		if (!this._tableContainer) {
			this._tableContainer = new UIComponent()
			this._tableContainer.component().classList.add('tableContainer')
			if (this.csvData) {
				this._tableContainer.component().appendChild(this.bodyPlusElement())
			}
		}
		return this._tableContainer
	}
	bodyPlusElement() {
		if (this._bodyPlusElement) {
			return this._bodyPlusElement
		}
		let bodyPlusElement = this.createBodyPlusElement()
		let boxHeadElement = this.createBoxHeadElement()
		let body = this.bodyElement()
		let boxTailElement = this.createBoxTailElement()

		if (this.stubColumnCount > 0) {
			let stubElement = document.createElement('div')
			stubElement.className = 'stub'
			for (var columnIndex = 0; columnIndex < this.stubColumnCount; columnIndex += 1) {
				let columnElement = document.createElement('div')
				let isLastStub = columnIndex == this.stubColumnCount - 1
				columnElement.className = 'column'
				if (isLastStub) {
					columnElement.classList.add('last')
				}
				stubElement.appendChild(columnElement)
			}
			bodyPlusElement.appendChild(stubElement)
		}
		bodyPlusElement.appendChild(boxHeadElement)
		bodyPlusElement.appendChild(body)
		bodyPlusElement.appendChild(boxTailElement)
		this._bodyPlusElement = bodyPlusElement
		return this._bodyPlusElement
	}
	createBodyPlusElement() {
		let bodyPlusElement = document.createElement('div')
		bodyPlusElement.className = 'bodyPlus'
		return bodyPlusElement
	}
	createBoxHeadElement() {
		let rowDataArray = [this.csvData.header]
		let boxHeadElement = document.createElement('div')
		boxHeadElement.className = 'boxHead'
		rowDataArray.forEach((rowData) => {
			let headerElement = this.createRowElement(rowData, true)
			boxHeadElement.appendChild(headerElement)
		})
		return boxHeadElement
	}
	createBoxTailElement() {
		let boxTailElement = document.createElement('div')
		boxTailElement.className = 'boxTail';
		let footerElement = this.createRowElement(this.csvData.header.map((key) => {
			return ''
		}), true)
		boxTailElement.appendChild(footerElement)
		return boxTailElement
	}
	bodyElement() {
		if (this._bodyElement) {
			return this._bodyElement
		}
		let keys = this.csvData.header,
			csvRows = this.csvData.data
		this._bodyElement = document.createElement('div')
		this._bodyElement.className = 'body'
		let rowRange = this.tableRowRange()
		for (var row = rowRange.from; row <= rowRange.to; row += 1) {
			let rowData = csvRows[row]
			let values = keys.map((key) => {
				return rowData[key]
			})
			let rowElement = this.createRowElement(values, false, row)
			rowElement.addEventListener('click', this.createSelectRowAction(rowData, rowElement, row))
			this._bodyElement.appendChild(rowElement)
		}
		return this._bodyElement
	}
	createRowElement(values, _isHeader, rowIndex) {
		let isHeader = _isHeader == true
		let rowElement = document.createElement('div')
		rowElement.className = 'row'
		if (isHeader) {
			rowElement.classList.add('header')
		}
		values.forEach((value, columnIndex) => {
			let isStub = columnIndex < this.stubColumnCount
			let isLastStub = isStub && (columnIndex == this.stubColumnCount - 1)
			let cellElement = this.createCellElement(value, isStub, isLastStub)
			rowElement.appendChild(cellElement)
		})
		return rowElement
	}
	createSelectRowAction(rowData, rowElement, rowIndex) {
		return (e) => {
			if (this.selectingRowElement) {
				this.selectingRowElement.classList.remove('select')
			}
			this.selectingRowElement = rowElement
			this.selectingRowElement.classList.add('select')
			this.selectRowAction(rowData, rowElement, rowIndex)
		}
	}
	createCellElement(value, isStub, isLastStub) {
		let cellElement = document.createElement('div')
		cellElement.className = 'cell'
		if (isStub) {
			cellElement.classList.add('stub')
			if (isLastStub) {
				cellElement.classList.add('last')
			}
		}
		cellElement.innerHTML = value
		return cellElement
	}

	updateTable() {
		this.updateBodyPlus()
	}
	updateBodyPlus() {
		this.updateBody()
	}
	updateBody() {
		this.clearBodyElement()
		let keys = this.csvData.header
		let rowRange = this.tableRowRange()
		for (var row = rowRange.from; row <= rowRange.to; row += 1) {
			let rowData = this.csvData.data[row]
			let values = keys.map((key) => {
				return rowData[key]
			})
			let rowElement = this.createRowElement(values, false, this.stubColumnCount)
			this.bodyElement().appendChild(rowElement)
		}
	}
	clearBodyElement() {
		while (this.bodyElement().childNodes.length > 0) {
			let node = this.bodyElement().childNodes.item(0)
			this.bodyElement().removeChild(node)
		}
	}
	tableRowRange() {
		let from = this.currentTableIndex * this.maxRowsByTable,
			to = from + this.maxRowsByTable
		if (this.currentTableIndex == this.tableCount() - 1) {
			to = from + this.csvData.data.length - (this.tableCount() - 1) * this.maxRowsByTable - 1
		}
		return {
			from: from,
			to: to
		}
	}
}
